/**
 * Shrinks a photo in the browser before upload: long side up to 2000px, JPEG at 82%.
 * Phone photos are often 4-8 MB, over the server's request limit; this brings them to a few hundred KB.
 */
export async function compressImage(file: File, maxSide = 2000, quality = 0.82): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error("El archivo debe ser una imagen (JPG, PNG o WebP).");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("No se pudo leer la imagen. Usa JPG, PNG o WebP.");
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no pudo procesar la imagen.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("No se pudo comprimir la imagen.");
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}
