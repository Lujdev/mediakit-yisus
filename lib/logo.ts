import sharp from "sharp";

const MAX_WIDTH = 480;

/**
 * Turns a logo on a solid white background into a transparent PNG.
 * Recovers alpha from how far each pixel is from white, then un-premultiplies the
 * colour so anti-aliased edges stay clean. Logos that already have transparency pass through.
 */
export async function processLogo(input: Buffer): Promise<Buffer> {
  const meta = await sharp(input).metadata();
  const hasAlpha = Boolean(meta.hasAlpha);

  const base = sharp(input).rotate().trim({ threshold: 14 });
  if (hasAlpha) {
    return base
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  const { data, info } = await base
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, o = 0; i < data.length; i += 3, o += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let a = 1 - Math.min(r, g, b) / 255;
    a = a < 0.03 ? 0 : Math.min(1, (a - 0.03) / 0.9);
    if (a === 0) {
      out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0;
      continue;
    }
    const un = (c: number) => Math.max(0, Math.min(255, Math.round((c - 255 * (1 - a)) / a)));
    out[o] = un(r);
    out[o + 1] = un(g);
    out[o + 2] = un(b);
    // Light logo colours (gold, pink) read as translucent; boost so a white-tinted render stays solid.
    out[o + 3] = Math.round(Math.min(1, a * 1.25) * 255);
  }

  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}
