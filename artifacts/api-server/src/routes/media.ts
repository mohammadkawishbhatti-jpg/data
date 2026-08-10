import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAdmin } from "../middlewares/auth";

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
router.post("/admin/media/upload", requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  // Second-pass magic-byte check — catches files with fake extensions
  const isSafe = checkMagicBytes(req.file.path);
  if (!isSafe) {
    try { fs.unlinkSync(req.file.path); } catch {}
    return res.status(400).json({ error: "File content does not match allowed image/document types." });
  }

  res.json({
    url: `/api/uploads/${req.file.filename}`,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
  });
});

// GET /api/admin/media
router.get("/admin/media", requireAdmin, (_req, res) => {
  try {
    const files = fs.readdirSync(UPLOADS_DIR)
      .filter(f => !f.startsWith("."))
      .map(filename => {
        const stat = fs.statSync(path.join(UPLOADS_DIR, filename));
        return { filename, url: `/api/uploads/${filename}`, size: stat.size, createdAt: stat.birthtime.toISOString() };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(files);
  } catch {
    res.status(500).json({ error: "Could not list media" });
  }
});

// DELETE /api/admin/media/:filename
router.delete("/admin/media/:filename", requireAdmin, (req, res) => {
  try {
    const filename = path.basename(String(req.params.filename));
    const filepath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filepath)) return res.status(404).json({ error: "Not found" });
    fs.unlinkSync(filepath);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Could not delete file" });
  }
});

export default router;
