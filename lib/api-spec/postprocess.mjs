#!/usr/bin/env node
// Post-process orval-generated files to fix Zod v3 compatibility and duplicate exports.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

// 1. Patch zod.looseObject → zod.object (Zod v3 doesn't have looseObject)
const zodGenerated = path.join(root, "lib/api-zod/src/generated/api.ts");
if (fs.existsSync(zodGenerated)) {
  let content = fs.readFileSync(zodGenerated, "utf8");
  content = content.replace(/zod\.looseObject/g, "zod.object");
  // Zod v4 uses zod.int() but v3 uses zod.number().int()
  content = content.replace(/\bzod\.int\(\)/g, "zod.number().int()");
  fs.writeFileSync(zodGenerated, content);
  console.log("✓ Patched zod.looseObject → zod.object and zod.int() → zod.number().int()");
}

// 2. Rewrite api-zod/src/index.ts — no generated/types (causes AdminLoginResponse collision)
const zodIndex = path.join(root, "lib/api-zod/src/index.ts");
fs.writeFileSync(
  zodIndex,
  `// Generated Zod validators (from OpenAPI spec via orval)
export * from "./generated/api";
// Additional request validators not covered by OpenAPI spec
export * from "./extra-validators";
`
);
console.log("✓ Rewrote api-zod/src/index.ts");

// 3. Rewrite api-client-react/src/index.ts — no duplicates
const reactIndex = path.join(root, "lib/api-client-react/src/index.ts");
fs.writeFileSync(
  reactIndex,
  `export * from "./generated/api";
export * from "./generated/api.schemas";
export { setBaseUrl, setAuthTokenGetter } from "./custom-fetch";
export type { AuthTokenGetter } from "./custom-fetch";
`
);
console.log("✓ Rewrote api-client-react/src/index.ts");
