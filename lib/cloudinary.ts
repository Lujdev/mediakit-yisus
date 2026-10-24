import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export function getOptimizedUrl(publicId: string, options: { width?: number; format?: string } = {}) {
  const { width = 800, format = "auto" } = options;
  return cloudinary.url(publicId, {
    width,
    crop: "limit",
    fetch_format: format,
    quality: "auto",
  });
}

export function getVideoUrl(publicId: string) {
  return cloudinary.url(publicId, {
    resource_type: "video",
    format: "mp4",
    quality: "auto",
  });
}
