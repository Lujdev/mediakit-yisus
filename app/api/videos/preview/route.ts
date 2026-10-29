import { NextRequest, NextResponse } from "next/server";
import { fetchPreviewImage } from "@/lib/video-preview";

/** Resolving a page and its cover can take a few seconds on a cold request. */
export const maxDuration = 30;

/**
 * Cover image for a video link the admin pasted (Instagram, TikTok, YouTube).
 * Streams the image from our own domain so signed CDN URLs and their expiry never reach the page.
 */
export async function GET(req: NextRequest) {
  const image = await fetchPreviewImage(req.nextUrl.searchParams.get("url"));
  if (!image) {
    // Short negative cache: a broken/private link should not be retried on every view.
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "public, max-age=60" } });
  }
  return new NextResponse(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.type,
      "Content-Length": String(image.data.length),
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
    },
  });
}
