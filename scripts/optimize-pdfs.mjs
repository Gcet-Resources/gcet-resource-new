import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const INPUT_DIR = process.argv[2] || "public/pdfs";
const OUT_DIR = process.argv[3] || "public/pdfs-optimized";

function which(bin) {
  try {
    return execSync(`which ${bin}`).toString().trim();
  } catch (e) {
    return null;
  }
}

async function main() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error("Input directory does not exist:", INPUT_DIR);
    process.exit(1);
  }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const qpdf = which("qpdf");
  const gs = which("gs") || which("ghostscript");

  const files = fs
    .readdirSync(INPUT_DIR)
    .filter((f) => f.toLowerCase().endsWith(".pdf"));
  if (files.length === 0) {
    console.log("No PDFs found in", INPUT_DIR);
    process.exit(0);
  }

  for (const file of files) {
    const inPath = path.join(INPUT_DIR, file);
    const outPath = path.join(OUT_DIR, file);
    console.log("Processing", file);

    if (qpdf) {
      try {
        // linearize (optimize for web)
        execSync(
          `qpdf --linearize ${JSON.stringify(inPath)} ${JSON.stringify(
            outPath
          )}`
        );
        console.log(" - linearized ->", outPath);
      } catch (e) {
        console.warn(
          " - qpdf failed, copying original",
          e.message?.slice?.(0, 120)
        );
        fs.copyFileSync(inPath, outPath);
      }
    } else if (gs) {
      try {
        // fallback compress with ghostscript
        execSync(
          `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dBATCH -sOutputFile=${JSON.stringify(
            outPath
          )} ${JSON.stringify(inPath)}`
        );
        console.log(" - ghostscript compressed ->", outPath);
      } catch (e) {
        console.warn(" - ghostscript failed, copying original");
        fs.copyFileSync(inPath, outPath);
      }
    } else {
      console.log(
        " - no qpdf/ghostscript found; copying original and printing suggested commands"
      );
      fs.copyFileSync(inPath, outPath);
      console.log("   Suggested commands:");
      console.log("   qpdf --linearize", inPath, outPath);
      console.log("   or");
      console.log(
        "   gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dBATCH -sOutputFile=" +
          outPath +
          " " +
          inPath
      );
    }

    // (Optional) generate a lightweight thumbnail using ImageMagick `convert` if available
    const convert = which("convert");
    if (convert) {
      const thumbPath = path.join(OUT_DIR, file.replace(/\.pdf$/i, ".png"));
      try {
        execSync(
          `${convert} ${JSON.stringify(
            outPath
          )}[0] -thumbnail 800x -background white -alpha remove ${JSON.stringify(
            thumbPath
          )}`
        );
        console.log(" - thumbnail created ->", thumbPath);
      } catch (e) {
        console.warn(" - thumbnail generation failed");
      }
    } else {
      console.log(" - ImageMagick `convert` not found; skipping thumbnail");
    }
  }

  console.log("Done. Optimized PDFs placed in", OUT_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
