import type { ProjectDetail } from "../types";

const detail: ProjectDetail = {
  slug: "video-search",
  match: { github: "https://github.com/jai0651/VLM" },
  title: "Video search from scratch",
  oneLiner:
    "A search engine for long videos that answers a question with the timestamps and frames that support the answer.",
  overview: [
    "Upload a two-hour lecture and ask when backpropagation was explained, or find every segment with a red car. The answer should come back with the timestamps and frames that prove it, never a naked generation.",
    "I built it to learn retrieval over time-based media, one measured module at a time on an M4 with 16 GB. Three pieces are written from scratch (a mini-CLIP, a nearest-neighbour index built up from brute force through IVF to HNSW, and a shot detector) and then measured against the production version behind the same interface. The scratch versions lose, and they're meant to: you can't reason about a retrieval stack you've never implemented.",
  ],
  highlights: [
    { value: "17×", label: "faster to scan frames for change (517 frames/s) than to embed them with CLIP (30.5 frames/s)" },
    { value: "4 min", label: "projected to index a two-hour lecture, from a measured real-time factor of 0.030" },
    { value: "0.389 → 0.778", label: "answerability, best single modality against fused speech, visual and on-screen text" },
    { value: "0.944 vs 0.556", label: "citing the right moment: budgeted evidence packet against the whole transcript" },
  ],
  how: [
    {
      title: "Decode with real timestamps",
      body: "Time comes from the container's presentation timestamps, not frame index divided by fps, which drifts without bound on variable-rate screen recordings. A two-hour 720p lecture is 556 GB fully decoded, so it never is: at 0.2 fps and 336 px it's 260 MB of pixels and 2.8 MB of index.",
    },
    {
      title: "Select frames cheaply",
      body: "A pixel-difference signal at 96 px scans every frame, and only frames that survive go to the encoder. On the test fixture that cut 354 frames to 57 with nothing lost.",
    },
    {
      title: "Index three channels",
      body: "Whisper base.en gives a transcript with word-level timestamps, chunked into 7–17 s segments. CLIP embeds the selected frames, and OCR reads on-screen text, deduplicated across near-identical slides (89 frames to 14 spans).",
    },
    {
      title: "Retrieve and fuse over time",
      body: "A two-hour lecture is 1,440 vectors, so each channel is searched exactly by brute force. Results are fused over time rather than by unit id, with a sum of calibrated scores, which gives hit@1 of 0.889.",
    },
    {
      title: "Rerank into intervals",
      body: "Adjacent hits are merged into one span and rescored with a cross-encoder at 2.6 ms per candidate, which lifts hit@1 from 0.889 to 0.944.",
    },
    {
      title: "Answer with evidence",
      body: "A token-budgeted packet of frames and text, each carrying its timestamp, goes to Qwen2-VL-2B running locally at 5.5 s per question. One 336 px frame costs 86 tokens, which is why the packet has a budget.",
    },
  ],
  decisions: [
    {
      title: "Uniform sampling won",
      body: "I expected content-aware frame selection to beat uniform sampling. It didn't, at any budget, because motion is anti-correlated with information: a sliding square scores 0.047 of change, a whole new slide 0.014.",
    },
    {
      title: "Brute force over an index",
      body: "There is no best index. IVF won on clustered data (0.917 vs 0.866) and HNSW on low-rank data (0.991 vs 0.792). My HNSW matched FAISS recall within 0.03 but ran queries 35× slower, and for 1,440 vectors exact search is the right answer anyway.",
    },
    {
      title: "The metric was wrong, not the model",
      body: "My timestamp metric reported 0.60 s mean error, and an oracle transcript that was perfect by construction scored 0.64 s. The metric picked which words to score using the predicted timings, which is circular. Aligning by text gave 0.15 s, four times better than the number I'd first published.",
    },
    {
      title: "Finding the moment isn't answering",
      body: "Visual questions scored hit@5 of 1.000 on a speech-only system: the narration found the right moment but never named the colour. A separate answerability metric read 0.778 for speech questions and 0.000 for every other type until CLIP and OCR came in.",
    },
  ],
  stack: [
    { group: "Models", items: ["Whisper base.en (faster-whisper)", "CLIP", "mini-CLIP (from scratch)", "MiniLM", "cross-encoder", "Qwen2-VL-2B"] },
    { group: "Retrieval", items: ["FAISS", "IVF and HNSW (from scratch)"] },
    { group: "Video and text", items: ["PyAV", "ffmpeg", "rapidocr"] },
    { group: "Tooling", items: ["Python 3.12", "PyTorch", "uv", "Jupyter", "pytest"] },
  ],
  status:
    "Open source learning project. Modules M0–M9 are built and measured; the held-out benchmark, the from-scratch video encoder and the serving UI are still to come.",
  sources: [
    "http://localhost:3100/api/admin/projects (database entry)",
    "https://github.com/jai0651/VLM (README)",
    "https://www.jaishankar.dev/blog/video-search-from-scratch (read via https://www.jaishankar.dev/feed.xml)",
  ],
};

export default detail;
