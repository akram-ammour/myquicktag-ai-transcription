"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Square,
  RotateCcw,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function AudioRecorder() {
  const [status, setStatus] = useState<"idle" | "recording" | "transcribing">(
    "idle",
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = async () => {
    setError(null);
    setTranscription("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
    } catch (err: any) {
      setError("Microphone not found or access denied.");
    }
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setStatus("idle");
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const reset = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setTranscription("");
    setError(null);
    setStatus("idle");
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;
    setStatus("transcribing");

    const form = new FormData();
    form.append("file", audioBlob, "recording.webm");

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      // Simulate "Streaming" effect by appending character by character
      const fullText = data.text;
      let currentText = "";
      for (let i = 0; i < fullText.length; i++) {
        currentText += fullText[i];
        setTranscription(currentText);
        await new Promise((resolve) => setTimeout(resolve, 20)); // Adjust speed here
      }
    } catch (err) {
      setError("Transcription failed.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md p-6 border rounded-[2rem] bg-background shadow-xl">
      {error && (
        <Alert variant="destructive" className="rounded-2xl py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-center gap-4">
        {/* RECORD / STOP BUTTON */}
        {status !== "recording" ? (
          <Button
            onClick={start}
            size="icon"
            className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 shadow-lg transition-all active:scale-95"
          >
            <Mic className="h-6 w-6 text-white" />
          </Button>
        ) : (
          <Button
            onClick={stop}
            size="icon"
            className="h-14 w-14 rounded-full bg-zinc-900 dark:bg-zinc-100 shadow-lg animate-pulse"
          >
            <Square className="h-6 w-6 fill-current" />
          </Button>
        )}

        {/* RESET BUTTON */}
        <Button
          variant="outline"
          size="icon"
          onClick={reset}
          disabled={!audioUrl || status === "recording"}
          className="h-12 w-12 rounded-full border-2 transition-all active:scale-95"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        {/* TRANSCRIBE BUTTON */}
        <Button
          onClick={transcribeAudio}
          disabled={
            !audioBlob || status === "recording" || status === "transcribing"
          }
          size="icon"
          className="h-12 w-12 rounded-full bg-teal-500 hover:bg-teal-600 shadow-md transition-all active:scale-95"
        >
          {status === "transcribing" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5 text-white" />
          )}
        </Button>
      </div>

      {/* AUDIO PLAYER & STREAMING TEXT */}
      {(audioUrl || transcription) && (
        <div className="space-y-4 pt-4 border-t">
          {audioUrl && (
            <audio src={audioUrl} controls className="w-full h-8 opacity-80" />
          )}

          <div className="min-h-[100px] p-4 rounded-2xl bg-muted/50 text-sm leading-relaxed text-foreground/80 italic">
            {status === "transcribing" && !transcription ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> AI is thinking...
              </span>
            ) : (
              transcription || "Your transcription will appear here..."
            )}
          </div>
        </div>
      )}
    </div>
  );
}
