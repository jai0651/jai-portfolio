import type { ProjectDetail } from "../types";

const detail: ProjectDetail = {
  slug: "voice-agent",
  match: { github: "https://github.com/jai0651/VAD-ASR" },
  title: "Voice agent from scratch",
  oneLiner:
    "A real-time voice agent where I built every layer myself in PyTorch: features, voice activity detection, speech recognition, text-to-speech, denoising and speaker ID.",
  overview: [
    "Most voice agents are a chain of API calls. That works, but you never learn why a recognizer hallucinates over silence or why synthesised speech sounds metallic. I wanted to understand every stage, so I built each one from first principles and kept a runnable script at every step.",
    "The repo is a curriculum of ten modules that connect into one loop: mic, denoise, VAD, endpointing, ASR, a reply, TTS, speaker. Every stage is a swappable engine, so I can run my own models against what production systems use on the same audio. Whisper base.en still wins by a wide margin, trained on about 165,000× more data, and that gap is the point the project makes.",
  ],
  highlights: [
    {
      value: "1.076 → 0.607",
      label:
        "Word error rate after swapping the BiGRU+CTC baseline for a Conformer, on the same 4.1 h of training audio",
    },
    { value: "2.7×", label: "Faster inference from the same architecture change" },
    {
      value: "3%",
      label: "Relative cost in word error of streaming with 640 ms chunks",
    },
    {
      value: "6.80% EER",
      label:
        "Speaker verification on 8 speakers held out of training (95% CI 6.13–7.44)",
    },
  ],
  how: [
    {
      title: "Features and denoising",
      body: "Audio becomes a log-mel spectrogram that I compute by hand. A spectral denoiser built from MCRA noise tracking and log-MMSE/OM-LSA cleans the signal for the VAD only, measured at +5.3 dB SNR with 16 ms latency.",
    },
    {
      title: "Voice activity detection",
      body: "A tiny 1-D convolutional frame classifier, about 55,000 parameters, decides speech or silence per frame. Hysteresis smoothing stops it flickering.",
    },
    {
      title: "Endpointing",
      body: "A state machine with no model decides when a turn has ended. If the utterance sounds finished it commits after 300 ms; if it trails off on \"and\", \"so\" or \"um\" it waits 950 ms, and a 320 ms redemption window stops a breath ending the turn.",
    },
    {
      title: "Recognition",
      body: "The modern recognizer is a Conformer with BPE subwords, relative-position attention and a hybrid CTC/attention head on one shared encoder. Chunked attention masks and a causal convolution let one set of weights stream at different latencies.",
    },
    {
      title: "Reply and speech",
      body: "The reply slot echoes by default, or calls OpenAI or Claude with per-session history. A Tacotron-style attention model turns text into mels, and Griffin-Lim or my Vocos-style ISTFT vocoder turns mels into audio, one sentence at a time so barge-in wastes at most one sentence.",
    },
    {
      title: "Server and swaps",
      body: "A WebSocket server streams mic audio from the browser and reports p50/p95 latency per stage. Each stage can swap to a production engine: Silero VAD v5, faster-whisper, Kokoro-82M, or the GTCRN and DTLN denoisers.",
    },
  ],
  decisions: [
    {
      title: "A failure the loss couldn't see",
      body: "My Conformer learned that emitting blank on every frame was a safe answer with a finite loss: 100% of frames decoded to blank and greedy decoding returned an empty string. I nearly spent three days shrinking the subword vocabulary from 1024 to 256. An hour reading reference recipes showed ESPnet uses 5,000 subwords on the same corpus, so the vocabulary was never the problem.",
    },
    {
      title: "The VAD was a data problem",
      body: "My first VAD reported P(speech) = 1.0 on room noise with nobody talking. Same architecture, same training loop, corrected data, and the same input scores 0.04. A hard-case evaluation set written before training then chose the checkpoint: 0.806 at step 2750, against 0.699 at the final step.",
    },
    {
      title: "Two ideas that measured worse",
      body: "Restricting TTS attention to a window at decode time took half an hour to write and doubled the error, because the model was trained on a full softmax. Running the decoder on Apple's MPS backend was 13× slower than CPU, since tiny sequential ops are dominated by dispatch overhead.",
    },
    {
      title: "Reporting the result that didn't resolve",
      body: "Both trained speaker encoders beat the untrained 11.10% floor, but AAM-softmax against plain softmax did not separate: the confidence intervals overlap and the medians are identical. With only 32 training speakers the experiment can't tell, and the README says so rather than picking the flattering number.",
    },
  ],
  stack: [
    {
      group: "Models (built from scratch)",
      items: [
        "1-D conv VAD",
        "BiGRU + CTC",
        "Conformer, hybrid CTC/attention",
        "Tacotron-mini",
        "Vocos-style ISTFT vocoder",
        "ECAPA-lite, AAM-softmax",
      ],
    },
    {
      group: "Production alternates",
      items: ["Silero VAD v5", "faster-whisper", "Kokoro-82M", "GTCRN", "DTLN", "OpenAI", "Claude"],
    },
    {
      group: "Audio / DSP",
      items: ["log-mel", "MCRA", "log-MMSE / OM-LSA", "Griffin-Lim", "BPE", "SpecAugment"],
    },
    { group: "Backend", items: ["Python", "PyTorch", "torchaudio", "ONNX Runtime", "WebSocket"] },
    { group: "Data", items: ["LibriSpeech"] },
    { group: "Tooling", items: ["uv", "pytest", "Apple MPS"] },
  ],
  status:
    "Open source learning repo. Runs on a Mac (MPS) or CPU. Diarization is not written yet.",
  links: [
    { label: "Write-up: how text to speech works", href: "/blog/how-text-to-speech-works" },
  ],
  sources: [
    "https://github.com/jai0651/VAD-ASR (README)",
    "https://www.jaishankar.dev/blog/speech-recognition-from-scratch",
    "https://www.jaishankar.dev/blog/how-text-to-speech-works",
    "http://localhost:3100/api/admin/projects (database entry: Voice agent from scratch (VAD-ASR))",
  ],
};

export default detail;
