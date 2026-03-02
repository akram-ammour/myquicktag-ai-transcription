import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY! });

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Convert file to base64
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Audio = buffer.toString("base64");

  try {
    const contents = [
      {
        text: "Transcribe this audio file accurately. Return only the transcription text.",
      },
      {
        inlineData: {
          mimeType: file.type || "audio/webm",
          data: base64Audio,
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: contents,
    });

    const text = response.text;

    return NextResponse.json({ text });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 },
    );
  }
}
