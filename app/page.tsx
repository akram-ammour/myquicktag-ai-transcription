import AudioRecorder from "@/components/audio-recorder";

export default function Home() {
  return (
    <div className="flex flex-col space-y-2  min-h-screen antialiased p-8  dark:bg-[#0a0a0a]">
      <h1 className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 font-semibold to-emerald-700 text-3xl">
        Prototype 1
      </h1>
      <div className="flex-1 h-full p-2 dark:text-white mt-4 border rounded-4xl">
        <AudioRecorder />
      </div>
    </div>
  );
}
