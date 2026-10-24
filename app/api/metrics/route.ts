import { NextRequest, NextResponse } from "next/server";

// Default metrics based on real data
let metrics = {
  instagram: {
    followers: "12.1K",
    views: "2M+",
    newFollowers: "+1,610",
  },
  tiktok: {
    followers: "14K",
    views: "1.1M",
    likes: "171.6K",
  },
};

export async function GET() {
  return NextResponse.json(metrics);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.instagram) metrics.instagram = { ...metrics.instagram, ...body.instagram };
    if (body.tiktok) metrics.tiktok = { ...metrics.tiktok, ...body.tiktok };
    return NextResponse.json({ success: true, metrics });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
