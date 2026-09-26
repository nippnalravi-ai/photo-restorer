import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // 1. Convert base64 data URL to a binary Buffer
    const base64Data = image.split(",")[1] || image;
    const imageBuffer = Buffer.from(base64Data, "base64");

    // 2. Call Hugging Face API with binary image payload
    const response = await fetch(
      "https://api-inference.huggingface.co/models/VINAI/UpScale",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/octet-stream",
        },
        body: imageBuffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Hugging Face API error (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    // 3. Convert returned binary output back to a Base64 data URL
    const arrayBuffer = await response.arrayBuffer();
    const resultBase64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;

    return NextResponse.json({ result: resultBase64 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to connect to API" },
      { status: 500 }
    );
  }
}
