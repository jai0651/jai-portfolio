import type { ProjectDetail } from "../types";

const detail: ProjectDetail = {
  slug: "vela",
  match: { github: "https://github.com/jai0651/Vela" },
  title: "Vela",
  oneLiner:
    "A voice assistant that lives in a process on my laptop, sees the room through the camera and answers out loud in about two seconds.",
  overview: [
    "An assistant you talk to has one hard requirement: it has to answer fast enough that you don't feel the gap. The second problem is honesty. Companion-style assistants have nothing real to report, so they make up an inner life, and you feel the lie inside ninety seconds.",
    "Vela is a daemon that keeps running after you close the window. She hears you, sees the room through the camera, answers out loud and has a body, an android at a desk rendered in three.js. Everything except the language model runs on an M4 MacBook Air with 16 GB. The rule is no theatre: if she did nothing, she says she did nothing, and anything she reports about herself has to be a row in her database.",
  ],
  highlights: [
    { value: "≈2 s", label: "from the end of your sentence to the start of hers" },
    { value: "13.2×", label: "realtime speech synthesis with Kokoro-82M on the laptop" },
    { value: "1/4 → 4/5", label: "hallucination traps passed by small models once their limits were in the prompt" },
  ],
  how: [
    {
      title: "Hear speech",
      body: "Silero VAD v5 runs on 512-sample frames at 16 kHz on the CPU and costs about 1 ms. It tells me a pause happened, which is not the same as the turn ending.",
    },
    {
      title: "Decide the turn is over",
      body: "A linguistic layer sits on top. If the utterance sounds finished it commits after 300 ms; if it trails off on 'and', 'so' or 'um' it waits 950 ms. A ~320 ms redemption window stops a breath ending your turn, and a ~220 ms pre-speech pad keeps the first consonant.",
    },
    {
      title: "Transcribe",
      body: "whisper-base.en runs through MLX on the Metal GPU in about 0.3 s.",
    },
    {
      title: "Match commands, then think",
      body: "Opening an app, pausing music, setting a timer and asking the time are matched with regular expressions before any model call. Anything else goes to ministral-3b through OpenRouter (0.67 s), with a situation summary read fresh from SQLite on every turn.",
    },
    {
      title: "Speak",
      body: "Kokoro-82M synthesises the reply at 13.2× realtime, about 0.2 s. The mic is ignored while she speaks plus a ~350 ms tail, otherwise the speaker leaks into the mic and she answers her own voice in a loop.",
    },
  ],
  decisions: [
    {
      title: "Endpointing costs more than transcription",
      body: "Endpointing has no model in it and still costs 300–950 ms, the second most expensive stage in the loop. If you want a voice agent under two seconds, look there first, not at a smaller transcription model.",
    },
    {
      title: "Regex before the model",
      body: "Commands answer instantly, identically every time, and nothing can talk them out of it. Wherever correct behaviour is fully specified, a model converts a guarantee into a probability.",
    },
    {
      title: "Telling the model what it can't do",
      body: "Ask a 3B model what's in your calendar and it invents a meeting, with a time. Listing the absences in the prompt (no calendar, no email, no files, no location) moved the small models from 1 out of 4 to 4 out of 5 on hallucination traps.",
    },
    {
      title: "Why voice cloning was slow",
      body: "My clone pipeline took 34.9 s to speak 4.9 s of audio. Profiling by stage showed the autoregressive token generator was 28.4 s of it (81.3%), at 4.4 tokens/s where realtime needs 25. Kokoro is fast because it predicts a whole mel spectrogram in essentially one shot.",
    },
  ],
  stack: [
    { group: "Models", items: ["Silero VAD v5", "whisper-base.en", "ministral-3b (OpenRouter)", "Kokoro-82M"] },
    { group: "Runtimes", items: ["MLX", "PyTorch (MPS)"] },
    { group: "Memory", items: ["SQLite"] },
    { group: "Body", items: ["three.js", "Next.js", "MediaPipe"] },
    { group: "Backend", items: ["Python daemon"] },
  ],
  status: "Open source, runs on a Mac. The language model is the only remote call.",
  sources: [
    "http://localhost:3100/api/admin/projects (database entry)",
    "https://github.com/jai0651/Vela (README)",
    "https://www.jaishankar.dev/blog/local-ai-assistant-from-scratch (read via https://www.jaishankar.dev/feed.xml)",
  ],
};

export default detail;
