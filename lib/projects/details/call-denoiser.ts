import type { ProjectDetail } from "../types";

const detail: ProjectDetail = {
  slug: "call-denoiser",
  match: { title: "Real-time call denoiser" },
  title: "Real-time call denoiser",
  oneLiner:
    "A small macOS app that removes background noise from my microphone in real time, so Zoom, Meet or a softphone only hear my voice.",
  overview: [
    "Calling apps take whatever the microphone hears. I wanted to clean the audio once, before any of them see it, and without changing the apps.",
    "The app captures the real microphone, denoises it, and writes the clean audio to a virtual audio device. The calling app picks that device as its microphone. It ships three interchangeable engines (DeepFilterNet3, GTCRN and DTLN) that trade quality against CPU, and I benchmarked all three on real noisy speech.",
  ],
  highlights: [
    {
      value: "2.19 → 2.66",
      label: "PESQ-WB with GTCRN on 60 real noisy VoiceBank-DEMAND files (higher is better)",
    },
    {
      value: "8.6 → 17.3 dB",
      label: "SI-SDR with DTLN on the same files, the best signal fidelity of the three",
    },
    {
      value: "~3%",
      label: "of one CPU core for GTCRN on an M-series MacBook Air, against ~23% for DeepFilterNet3",
    },
    {
      value: "~32 ms",
      label: "added latency with the per-frame engines (GTCRN, DTLN). DeepFilterNet3 adds ~50 ms.",
    },
  ],
  how: [
    {
      title: "Capture the microphone",
      body: "`run.py live` reads the real microphone (chosen with `--input`) and keeps a buffer of recent audio.",
    },
    {
      title: "Denoise block by block",
      body: "The chosen engine cleans each block. GTCRN and DTLN carry their conv caches and RNN state from frame to frame, so each hop is exactly one forward pass.",
    },
    {
      title: "Write to a virtual mic",
      body: "Clean audio goes to BlackHole 2ch, a free virtual audio driver. In Zoom, Meet or a softphone you select BlackHole as the microphone.",
    },
    {
      title: "Test on a file first",
      body: "`run.py file noisy.wav clean.wav` runs the same pipeline on a recording, so you can A/B listen without any audio hardware.",
    },
  ],
  decisions: [
    {
      title: "Re-running 200 ms of audio every hop",
      body: "DeepFilterNet3's convolutions carry temporal context that gets zero-padded at chunk boundaries, so cheap per-frame streaming isn't possible without rewriting its state. For each ~40 ms output block it re-runs over ~200 ms of recent audio and keeps only the new block. That costs CPU, not latency.",
    },
    {
      title: "GTCRN for calls",
      body: "On 16 kHz call audio GTCRN had the best perceptual quality (PESQ 2.66) at about 3% CPU, so it's the engine I recommend. DeepFilterNet3 is a 48 kHz model and ran on upsampled audio in this test, which handicaps it.",
    },
    {
      title: "A virtual device, not an integration",
      body: "Because the output is an ordinary audio input, any calling app works unchanged. Nothing has to know the denoiser exists.",
    },
    {
      title: "A port checked bit for bit",
      body: "My GTCRN port reproduces the upstream reference's streamed output bit for bit, so its quality numbers are the model's, not an artefact of the port.",
    },
  ],
  stack: [
    { group: "Models", items: ["GTCRN", "DTLN", "DeepFilterNet3"] },
    { group: "Audio", items: ["BlackHole 2ch", "sounddevice"] },
    { group: "Runtime", items: ["Python 3.13", "PyTorch", "ONNX Runtime"] },
    { group: "Evaluation", items: ["PESQ", "STOI", "SI-SDR", "VoiceBank-DEMAND"] },
  ],
  status: "Runs locally on macOS. The code lives in the VAD-ASR repo.",
  links: [
    {
      label: "Source code (denoiser/ in VAD-ASR)",
      href: "https://github.com/jai0651/VAD-ASR/tree/main/denoiser",
    },
  ],
  sources: [
    "https://github.com/jai0651/VAD-ASR/blob/main/denoiser/README.md",
    "http://localhost:3100/api/admin/projects (database entry: Real-time call denoiser)",
  ],
};

export default detail;
