import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const GALLERY_CATEGORIES = ["Outfit", "Moda", "Lifestyle", "Portrait", "Editorial"] as const;
export const SHOT_PLATFORMS = ["instagram", "tiktok"] as const;
export const MEDIA_KINDS = ["hero", "about", "gallery", "shot"] as const;

/**
 * Normalises an uploaded photo: fixes orientation from EXIF, caps the long side at 2000px and re-encodes as JPEG.
 * Re-encoding also drops EXIF metadata (including GPS position), so a phone photo never leaks where it was taken.
 */
export async function processPhoto(input: Buffer): Promise<{ data: Buffer; mime: string }> {
  const data = await sharp(input)
    .rotate()
    .flatten({ background: "#ffffff" })
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return { data, mime: "image/jpeg" };
}

/** "50% 30%" style object-position; anything else falls back to the default. */
export function cleanFocal(value: unknown): string {
  return typeof value === "string" && /^\d{1,3}% \d{1,3}%$/.test(value.trim()) ? value.trim() : "50% 30%";
}
