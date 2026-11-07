import type { ProjectDetail } from "../types";

const detail: ProjectDetail = {
  slug: "voice-notetaker",
  match: { github: "https://github.com/jai0651/Local-AI-voice-notemaker" },
  title: "Local voice notetaker",
  oneLiner:
    "A command-line tool that turns speech into organised Obsidian notes, with every model running locally on a Mac.",
  overview: [
    "I wanted to think out loud and get back a tidy note: a summary, the main points and the things I said I'd do. I also wanted none of the audio or text to leave my laptop, which rules out cloud transcription and hosted LLMs.",
    "I talk to my Mac, Whisper transcribes on the Apple GPU, and a local Qwen model through Ollama organises the transcript into a markdown note in an Obsidian vault. Audio and notes stay on the laptop. The only optional network call sends a short search query, never note content, to attach reference links.",
  ],
  highlights: [],
  how: [
    {
      title: "Capture",
      body: "The record command listens until I press Enter, and the ingest command takes any audio or video file (mp3, wav, m4a, mp4, mov). ffmpeg decodes it, and the raw recording is kept in vault/Audio/.",
    },
    {
      title: "Transcribe",
      body: "Whisper large-v3-turbo runs through MLX on the Apple GPU. The first run downloads the model, about 1.6 GB, from Hugging Face.",
    },
    {
      title: "Organise",
      body: "qwen3.5:9b through Ollama, with thinking mode off, turns the transcript into a summary, main points, action-item checkboxes and a cleaned-up body.",
    },
    {
      title: "Write to the vault",
      body: "Each note lands in vault/Notes/YYYY-MM-DD-title.md as plain markdown with YAML frontmatter. The untouched raw transcript sits at the bottom in a collapsible Obsidian callout.",
    },
    {
      title: "Find, read and edit",
      body: "I can list and search notes, have one read aloud with macOS say, or edit it with a plain-English instruction, typed or dictated. Every edit backs up the previous version to vault/.backups/.",
    },
  ],
  decisions: [
    {
      title: "One narrow network exception",
      body: "Apart from the one-time model download, the only network feature is the optional --enrich flag. It sends short search queries to DuckDuckGo to attach reference links, and never sends the note itself.",
    },
    {
      title: "Keep the raw transcript",
      body: "The model's cleaned-up version is what I read, but the original transcript stays in every note, untouched, in a collapsed callout. Edits work the same way: the previous version is backed up before the new one is written.",
    },
    {
      title: "Swappable models",
      body: "The LLM and the Whisper checkpoint are environment variables. Any Ollama model works in place of qwen3.5:9b; llama3.1:8b is also installed.",
    },
  ],
  stack: [
    { group: "Models", items: ["Whisper large-v3-turbo", "qwen3.5:9b", "macOS say"] },
    { group: "Runtime", items: ["MLX", "Ollama", "Apple Silicon GPU"] },
    { group: "Audio", items: ["ffmpeg"] },
    { group: "Tooling", items: ["Python", "uv", "Obsidian (markdown + YAML frontmatter)"] },
  ],
  status: "Open source. Runs on an Apple Silicon Mac.",
  sources: [
    "https://github.com/jai0651/Local-AI-voice-notemaker (README)",
    "http://localhost:3100/api/admin/projects (database entry: Fully local voice notetaker)",
  ],
};

export default detail;
