import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();

    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      return NextResponse.json(
        { error: "HF_TOKEN environment variable is missing in Vercel." },
        { status: 500 }
      );
    }

    // Call Hugging Face Serverless API (GFP-GAN model)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/tencentarc/gfpgan",
      {
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/octet-stream",
        },
        method: "POST",
        body: bytes,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Hugging Face API Error: ${errorText}` },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = response.headers.get("content-type") || "image/png";
    const resultUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ resultUrl });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process image" },
      { status: 500 }
    );
  }
}
