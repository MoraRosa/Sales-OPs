/**
 * Writes a minimal, clean package.json into dist/ containing ONLY
 * real npm packages (firebase-admin, firebase-functions, googleapis).
 * This is what actually gets uploaded to Cloud Build when
 * firebase.json's functions "source" points at "dist" -- it deliberately
 * does NOT list @peak-empire/* workspace packages, because Cloud Build's
 * isolated npm install has no monorepo context and cannot resolve
 * "workspace:*" at all. Everything from those internal packages is
 * already inlined into dist/index.js by the esbuild bundle step.
 */
import { writeFileSync, readFileSync } from "fs";

const source = JSON.parse(readFileSync(new URL("../package.json", import.meta.url)));

const deployPackage = {
  name: source.name,
  version: source.version,
  private: true,
  type: "module",
  main: "index.js",
  engines: source.engines,
  dependencies: {
    "firebase-admin": source.dependencies["firebase-admin"],
    "firebase-functions": source.dependencies["firebase-functions"],
    googleapis: source.dependencies.googleapis,
  },
};

writeFileSync(new URL("../dist/package.json", import.meta.url), JSON.stringify(deployPackage, null, 2) + "\n");
console.log("Wrote clean dist/package.json for deploy (no workspace:* deps).");