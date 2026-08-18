import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { db, mediaAssetsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireCapability } from "../middlewares/auth";
import { recordMonitoringEvent } from "../lib/monitoring";

// Magic-byte signatures for allowed image/document types
const ALLOWED_SIGNATURES: Array<{ mime: string; bytes: number[]; offset?: number }> = [
  { mime: "image/jpeg",  bytes: [0xFF, 0xD8, 0xFF] },
  { mime: "image/png",   bytes: [0x89, 0x50, 0x4E, 0x47] },
  { mime: "image/gif",   bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: "image/webp",  bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF....WEBP
  { mime: "image/svg+xml", bytes: [0x3C] },  // starts with '<'
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: "image/x-icon", bytes: [0x00, 0x00, 0x01, 0x00] },
];

function checkMagicBytes(filePath: string): boolean {
  try {
    const buf = Buffer.alloc(12);
    const fd = fs.openSync(filePath, "r");
    fs.readSync(fd, buf, 0, 12, 0);
    fs.closeSync(fd);
    return ALLOWED_SIGNATURES.some(sig =>
      sig.bytes.every((b, i) => buf[i + (sig.offset ?? 0)] === b)
    );
  } catch { return false; }
}

const router = Router();

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, path.extname(file.originalname))
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
    cb(null, `${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/\.(jpg|jpeg|png|gif|webp|svg|pdf|ico)$/i.test(file.originalname)) cb(null, true);
    else cb(new Error("File type not allowed"));
  },
});

// POST /api/admin/media/upload
router.post("/admin/media/upload", requireCapability("media"), upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  // Second-pass magic-byte check — catches files with fake extensions
  const isSafe = checkMagicBytes(req.file.path);
  if (!isSafe) {
    try { fs.unlinkSync(req.file.path); } catch {}
    return res.status(400).json({ error: "File content does not match allowed image/document types." });
  }

  const isImage = req.file.mimetype.startsWith("image/") && req.file.mimetype !== "image/svg+xml" && req.file.mimetype !== "image/x-icon";
  let width: number | null = null;
  let height: number | null = null;
  const warnings: string[] = [];
  const variantUrls: Record<string, string> = {};
  let optimizationStatus = "not-applicable";

  if (req.file.size > 2 * 1024 * 1024) warnings.push("Large file: consider compressing below 2 MB.");
  if (isImage) {
    try {
      const metadata = await sharp(req.file.path).metadata();
      width = metadata.width ?? null;
      height = metadata.height ?? null;
      if ((width ?? 0) > 3000 || (height ?? 0) > 3000) warnings.push("Large dimensions: responsive variants will be used for delivery.");
      const stem = path.basename(req.file.filename, path.extname(req.file.filename));
      const makeVariant = async (label: string, format: "webp" | "avif", quality: number, resizeWidth: number) => {
        const filename = `${stem}-${label}.${format}`;
        await sharp(req.file!.path)
          .resize({ width: resizeWidth, withoutEnlargement: true })
          .toFormat(format, { quality })
          .toFile(path.join(UPLOADS_DIR, filename));
        variantUrls[`${label}-${format}`] = `/api/uploads/${filename}`;
      };
      await makeVariant("sm", "webp", 82, 480);
      await makeVariant("md", "webp", 82, 1200);
      await makeVariant("lg", "webp", 84, 2000);
      await makeVariant("md", "avif", 55, 1200);
      optimizationStatus = "complete";
    } catch (error) {
      optimizationStatus = "failed";
      warnings.push("Responsive conversion failed; original file is still available.");
      req.log.warn({ error }, "Media optimization failed");
      void recordMonitoringEvent({
        eventType: "media_failure",
        severity: "warning",
        route: req.path,
        method: req.method,
        message: "Responsive image conversion failed",
        metadata: { mimeType: req.file.mimetype, filename: req.file.filename },
      });
    }
  }

  const [asset] = await db.insert(mediaAssetsTable).values({
    filename: req.file.filename,
    originalName: req.file.originalname,
    url: `/api/uploads/${req.file.filename}`,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
    width,
    height,
    altText: typeof req.body?.altText === "string" ? req.body.altText.slice(0, 300) : null,
    variantUrls: { ...variantUrls, warnings, optimizationStatus },
    createdById: (req as any).session?.admin?.id ?? null,
  }).onConflictDoUpdate({
    target: mediaAssetsTable.filename,
    set: {
      originalName: req.file.originalname,
      sizeBytes: req.file.size,
      width,
      height,
      variantUrls: { ...variantUrls, warnings, optimizationStatus },
      updatedAt: new Date(),
    },
  }).returning();

  res.json({
    url: `/api/uploads/${req.file.filename}`,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
    width,
    height,
    altText: asset?.altText ?? null,
    variants: variantUrls,
    warnings,
    optimizationStatus,
  });
});

// GET /api/admin/media
router.get("/admin/media", requireCapability("media"), async (_req, res) => {
  try {
    const assets = await db.select().from(mediaAssetsTable);
    const indexed = new Map(assets.map(asset => [asset.filename, asset]));
    const files = fs.readdirSync(UPLOADS_DIR)
      .filter(f => !f.startsWith("."))
      .map(filename => {
        const stat = fs.statSync(path.join(UPLOADS_DIR, filename));
        const asset = indexed.get(filename);
        const variantMeta = (asset?.variantUrls || {}) as Record<string, unknown>;
        return {
          filename,
          url: `/api/uploads/${filename}`,
          originalName: asset?.originalName ?? filename,
          size: asset?.sizeBytes ?? stat.size,
          sizeBytes: asset?.sizeBytes ?? stat.size,
          mimeType: asset?.mimeType ?? "application/octet-stream",
          width: asset?.width ?? null,
          height: asset?.height ?? null,
          altText: asset?.altText ?? null,
          variants: Object.fromEntries(Object.entries(variantMeta).filter(([key]) => key.includes("-webp") || key.includes("-avif"))),
          warnings: Array.isArray(variantMeta.warnings) ? variantMeta.warnings : [],
          optimizationStatus: typeof variantMeta.optimizationStatus === "string" ? variantMeta.optimizationStatus : "legacy",
          createdAt: asset?.createdAt?.toISOString?.() ?? stat.birthtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(files);
  } catch {
    res.status(500).json({ error: "Could not list media" });
  }
});

router.patch("/admin/media/:filename", requireCapability("media"), async (req, res) => {
  try {
    const filename = path.basename(String(req.params.filename));
    const altText = typeof req.body?.altText === "string" ? req.body.altText.slice(0, 300) : null;
    const [asset] = await db.update(mediaAssetsTable).set({ altText, updatedAt: new Date() })
      .where(eq(mediaAssetsTable.filename, filename)).returning();
    if (!asset) return res.status(404).json({ error: "Media metadata not found" });
    res.json({ ...asset, createdAt: asset.createdAt.toISOString(), updatedAt: asset.updatedAt.toISOString() });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Could not update media metadata" });
  }
});

// DELETE /api/admin/media/:filename
router.delete("/admin/media/:filename", requireCapability("media"), async (req, res) => {
  try {
    const filename = path.basename(String(req.params.filename));
    const filepath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filepath)) return res.status(404).json({ error: "Not found" });
    fs.unlinkSync(filepath);
    await db.delete(mediaAssetsTable).where(eq(mediaAssetsTable.filename, filename));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Could not delete file" });
  }
});

export default router;
