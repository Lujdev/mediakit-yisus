import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

const FOLDER = "yisus-mediakit/videos";

/**
 * Returns a signed payload so the browser can upload a video straight to Cloudinary.
 * Videos exceed the serverless request body limit, so they never pass through this app.
 */
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary no está configurado" }, { status: 503 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ folder: FOLDER, timestamp }, apiSecret);
  return NextResponse.json({ cloudName, apiKey, timestamp, signature, folder: FOLDER });
}
