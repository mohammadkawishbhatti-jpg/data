// Replaces catalog: references with actual versions for pnpm v8 compatibility
import fs from "fs";
import path from "path";

// Catalog versions from pnpm-workspace.yaml
const catalog = {
  "@replit/vite-plugin-cartographer": "^0.5.21",
  "@replit/vite-plugin-dev-banner": "^0.1.1",
  "@replit/vite-plugin-runtime-error-modal": "^0.0.6",
  "@tailwindcss/vite": "^4.1.14",
  "@tanstack/react-query": "^5.90.21",
  "@types/node": "^25.3.3",
  "@types/react": "^19.2.0",
  "@types/react-dom": "^19.2.0",
  "@vitejs/plugin-react": "^5.0.4",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "drizzle-orm": "^0.45.2",
  "framer-motion": "^12.23.24",
  "lucide-react": "^0.545.0",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "tailwind-merge": "^3.3.1",
  "tailwindcss": "^4.1.14",
  "tsx": "4.23.1",
  "vite": "^7.3.2",
  "wouter": "^3.3.5",
  "zod": "^3.25.76",
};

// Package.json files to fix
const pkgFiles = [
  "artifacts/api-server/package.json",
  "artifacts/admin-panel/package.json",
  "artifacts/prime-site/package.json",
  "artifacts/customer-portal/package.json",
  "artifacts/mockup-sandbox/package.json",
  "lib/api-client-react/package.json",
  "lib/api-zod/package.json",
  "lib/db/package.json",
  "scripts/package.json",
];

let totalFixed = 0;

for (const file of pkgFiles) {
  if (!fs.existsSync(file)) continue;
  const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
  let changed = false;

  for (const section of ["dependencies", "devDependencies", "peerDependencies"]) {
    if (!pkg[section]) continue;
    for (const [name, ver] of Object.entries(pkg[section])) {
      if (ver === "catalog:" || ver.startsWith("catalog:")) {
        const resolved = catalog[name];
        if (resolved) {
          pkg[section][name] = resolved;
          changed = true;
          totalFixed++;
          console.log(`  ✓ ${file}: ${name} → ${resolved}`);
        } else {
          console.log(`  ⚠ ${file}: ${name} not in catalog`);
        }
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
  }
}

console.log(`\nFixed ${totalFixed} catalog: references`);
