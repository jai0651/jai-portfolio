import type { ProjectDetail } from "../types";

const detail: ProjectDetail = {
  slug: "tonecall",
  match: { github: "https://github.com/jai0651/tonecall" },
  title: "Tonecall",
  oneLiner:
    "Middleware that lets two AI voice agents on the same phone call recognise each other and move their negotiation off speech onto a JSON side-channel.",
  overview: [
    "When two AI voice agents call each other, both run speech-to-text, an LLM and text-to-speech on every turn. They use a phone line to send words that would fit in a small JSON object, and they pay for it in codec latency, model latency and per-minute telephony charges. Each voice turn costs four to six seconds.",
    "Tonecall detects the other machine in the audio path with an in-band DTMF handshake, before anything gets transcribed. Once both sides know, the negotiation moves to a JSON channel over WebSocket while the call stays open, because a human might join at any moment. If the peer is a person, it stays a normal voice agent the whole time.",
  ],
  highlights: [
    { value: "~3 s", label: "Data exchange over the JSON side-channel" },
    { value: "4–6 s", label: "Per turn on the voice path it replaces" },
    { value: "~18 s", label: "A full agent-to-agent call, end to end" },
  ],
  how: [
    {
      title: "Answer and tap the audio",
      body: "The CPaaS provider (Plivo) POSTs to my answer URL and I reply with XML call-control verbs. <Stream> opens a WebSocket of the call's audio frames, which I decode out of mu-law into PCM.",
    },
    {
      title: "DTMF handshake",
      body: "Each agent plays a short touch-tone sequence that acts as a pairing token. Anything that answers with a well-formed token is a machine, and a broker resolves which middleware instance owns that token.",
    },
    {
      title: "Voice intro",
      body: "The two agents greet each other in speech for about 10 seconds, with LLM-generated lines rather than scripts. This keeps the call legible to a human who joins late.",
    },
    {
      title: "JSON side-channel",
      body: "The real negotiation happens in one round trip over a /data WebSocket in about 3 seconds. In the demo a pizza shop's procurement agent with a ₹2500 budget places a wholesale order with a vegetable vendor.",
    },
    {
      title: "Voice goodbye",
      body: "About 5 seconds of speech close the call, referencing the order id, total and UPI details they just agreed, so there is an audible record of the deal.",
    },
    {
      title: "Human fallback",
      body: "If the peer never answers the probe, it's a person. The call falls through to a normal STT, LLM, TTS loop (whisper-1, gpt-5.2, tts-1) with no hint that anything else was tried.",
    },
  ],
  decisions: [
    {
      title: "Detect below the language layer",
      body: "Telling the model to be terse or to spot a robot from the transcript can't work: by the time a transcript exists, STT, the LLM and TTS have already run. Detection had to happen in the audio, which made it a signalling problem instead of a prompting one.",
    },
    {
      title: "DTMF, on purpose",
      body: "I don't control the channel, so the probe has to survive being turned into audio and back. Touch tones survive transcoding and pass through carriers I have no agreement with. The catch is that the probe must be short enough to hide inside a normal greeting, which limits how elaborate the handshake can get.",
    },
    {
      title: "Federated, not centralised",
      body: "My first build put both agents behind one orchestrator, which was cheating: a process that owns both sides never has to discover anything. Now two independent middleware instances each own one agent and pair in-band. The broker is still a soft centralisation, and fully peer-to-peer discovery is the honest end state.",
    },
    {
      title: "Trust is unresolved",
      body: "Right now a well-formed token is enough to be believed. Anything real needs the side-channel authenticated, or it will negotiate with whoever plays tones at it first.",
    },
  ],
  stack: [
    { group: "Models", items: ["OpenAI gpt-5.2", "whisper-1", "tts-1"] },
    { group: "Telephony", items: ["Plivo (CPaaS)", "DTMF", "mu-law codec", "ngrok"] },
    { group: "Backend", items: ["TypeScript", "Next.js custom server", "WebSocket (ws)", "SSE"] },
    { group: "Frontend", items: ["Next.js dashboard"] },
  ],
  status:
    "Open source. Live agent-to-agent calls have run on real provider numbers; the human path is wired but tested only in the simulator. The whole topology also runs locally with stubs and no API keys.",
  sources: [
    "https://github.com/jai0651/tonecall (README)",
    "https://www.jaishankar.dev/blog/tonecall-inter-agent-voice-handshake",
    "http://localhost:3100/api/admin/projects (database entry: Tonecall, an inter-agent voice handshake)",
  ],
};

export default detail;
