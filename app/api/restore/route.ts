import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    const falResponse = await fetch("https://fal.run/fal-ai/codeformer", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: base64Image,
        fidelity: 0.7,
      }),
    });

    if (!falResponse.ok) {
      const errText = await falResponse.text();
      return NextResponse.json({ error: `AI Processing failed: ${errText}` }, { status: 500 });
    }

    const data = await falResponse.json();
    const resultUrl = data.image?.url || data.image_url;

    return NextResponse.json({ resultUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
        }
