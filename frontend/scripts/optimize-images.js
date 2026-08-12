/* Converts the site's photographic PNGs to WebP at two widths.
   Run from the frontend directory: node <this file> */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const DIR = path.join(process.cwd(), 'public', 'images');
const WIDE = 1536; // desktop / full-bleed heroes (every source is at least this wide)
const SMALL = 800; // phones on a throttled connection

(async () => {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.png'));
  let before = 0;
  let after = 0;

  for (const file of files) {
    const src = path.join(DIR, file);
    const base = file.replace(/\.png$/, '');
    const meta = await sharp(src).metadata();
    before += fs.statSync(src).size;

    // `withoutEnlargement` keeps a 1536px source from being upscaled to 1600.
    const wide = path.join(DIR, `${base}.webp`);
    await sharp(src).resize({ width: WIDE, withoutEnlargement: true }).webp({ quality: 78 }).toFile(wide);

    const small = path.join(DIR, `${base}-800.webp`);
    await sharp(src).resize({ width: SMALL, withoutEnlargement: true }).webp({ quality: 72 }).toFile(small);

    const w = fs.statSync(wide).size;
    const s = fs.statSync(small).size;
    after += w + s;
    console.log(
      `${base.padEnd(36)} ${meta.width}x${meta.height} ` +
        `${(fs.statSync(src).size / 1024 / 1024).toFixed(2)}MB  ->  ` +
        `${(w / 1024).toFixed(0)}KB wide + ${(s / 1024).toFixed(0)}KB small`,
    );
  }

  // The logo keeps its PNG as well: metadata still points the favicon at it.
  const logo = path.join(process.cwd(), 'public', 'logo.png');
  before += fs.statSync(logo).size;
  const logoOut = path.join(process.cwd(), 'public', 'logo.webp');
  await sharp(logo).resize({ width: 600, withoutEnlargement: true }).webp({ quality: 88 }).toFile(logoOut);
  const lw = fs.statSync(logoOut).size;
  after += lw;
  console.log(`${'logo'.padEnd(36)} -> ${(lw / 1024).toFixed(0)}KB webp`);

  console.log(`\nTOPLAM  ${(before / 1024 / 1024).toFixed(1)}MB  ->  ${(after / 1024 / 1024).toFixed(1)}MB`);
})();
