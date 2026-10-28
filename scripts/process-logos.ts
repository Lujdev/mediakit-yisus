import { readFile, writeFile } from "node:fs/promises";
import { processLogo } from "../lib/logo";

// Source file in public/images -> processed transparent PNG in public/brands
const logos: Record<string, string> = {
  "hero_logo.webp": "hero.png",
  "logo_covas.png": "covas.png",
  "logo_rockstart.png": "rockstar.png",
  "samos_logo.webp": "samos.png",
  "bacc_logo.webp": "bacc.png",
  "logo_dernier.png": "dernier.png",
};

for (const [src, dest] of Object.entries(logos)) {
  const out = await processLogo(await readFile(`public/images/${src}`));
  await writeFile(`public/brands/${dest}`, out);
  console.log(`${src} -> public/brands/${dest} (${out.length} bytes)`);
}
