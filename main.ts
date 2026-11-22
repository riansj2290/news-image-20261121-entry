// news-image-20261121 entry program.
// Copies the entry image (entry.png, kept beside this file) into the output
// directory the harness names: $MAKEFUN_OUTPUT_DIR, or /output by default.
// Node 22, standard library only. Exits non-zero if the image is missing.
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "entry.png");

if (!existsSync(src)) {
  console.error(`entry image not found: ${src}`);
  process.exit(1);
}

// Sanity: the source must really be a PNG (8-byte signature) before we ship it.
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const head = readFileSync(src).subarray(0, 8);
if (!PNG_SIGNATURE.every((b, i) => head[i] === b)) {
  console.error(`entry image is not a PNG: ${src}`);
  process.exit(1);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });

const dest = join(outDir, "entry.png");
copyFileSync(src, dest);

// Verify the copy landed whole: a truncated write must fail the run, not pass silently.
const srcSize = statSync(src).size;
const destSize = statSync(dest).size;
if (destSize !== srcSize) {
  console.error(`copy verification failed: wrote ${destSize} of ${srcSize} bytes`);
  process.exit(1);
}
console.log(`wrote ${dest} (${destSize} bytes, verified)`);
