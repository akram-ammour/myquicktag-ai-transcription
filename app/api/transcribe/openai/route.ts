import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: "whisper-1",
    // ✅ Prompt here
    prompt:
      "Transcribe this audio file accurately. Return only the transcription text.",

    // Optional:
    temperature: 0, // more deterministic
  });

  return NextResponse.json({ text: transcription.text });
}
