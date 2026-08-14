"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
 * Browser-native voice for the chat, deliberately with no server component:
 * the Web Speech API means zero extra Vercel invocations, zero audio
 * bandwidth, and no new API keys.
 *
 * Honest caveats, because they matter:
 *  - Recognition is Chrome/Edge/Safari only. Firefox has no SpeechRecognition
 *    at all, so the mic is hidden rather than broken.
 *  - Chrome's recognition is NOT on-device — it streams audio to Google's
 *    service. This is not a privacy feature and isn't presented as one.
 *  - iOS gates speechSynthesis behind a user gesture, so auto-speaking a
 *    streamed reply can be silently dropped there.
 */

// ── Minimal typings: SpeechRecognition isn't in lib.dom ──────────────
interface SRAlternative {
  transcript: string;
  confidence: number;
}
interface SRResult {
  isFinal: boolean;
  length: number;
  [i: number]: SRAlternative;
}
interface SRResultList {
  length: number;
  [i: number]: SRResult;
}
interface SREvent extends Event {
  resultIndex: number;
  results: SRResultList;
}
interface SRErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
type SRConstructor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SRConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SRConstructor;
    webkitSpeechRecognition?: SRConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * How long to wait after speech stops before treating the turn as finished.
 * ~1.1s is the usual sweet spot: long enough to survive a mid-sentence pause,
 * short enough that the reply doesn't feel laggy.
 */
const ENDPOINT_SILENCE_MS = 1100;

export interface SpeechInput {
  supported: boolean;
  listening: boolean;
  /** Live partial transcript, for showing text as it's spoken. */
  interim: string;
  /** Mic loudness 0–1, for the level meter. 0 if metering is unavailable. */
  level: number;
  error: string | null;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

/**
 * Push-to-talk with automatic endpointing.
 *
 * `onFinal` fires once per turn, when the caller has stopped speaking for
 * ENDPOINT_SILENCE_MS — not on every interim result.
 */
export function useSpeechInput(onFinal: (text: string) => void): SpeechInput {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef("");
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  // Metering plumbing, kept separate so a getUserMedia failure can't stop
  // recognition from working.
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setSupported(!!getRecognitionCtor());
  }, []);

  const stopMeter = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setLevel(0);
  }, []);

  const startMeter = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);

      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        // RMS around the 128 midpoint, scaled to something usable in a UI.
        let sum = 0;
        for (const v of buf) {
          const d = (v - 128) / 128;
          sum += d * d;
        }
        setLevel(Math.min(1, Math.sqrt(sum / buf.length) * 4));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Metering is cosmetic — recognition has its own mic access.
    }
  }, []);

  const commit = useCallback(() => {
    const text = finalRef.current.trim();
    finalRef.current = "";
    setInterim("");
    if (text) onFinalRef.current(text);
  }, []);

  const stop = useCallback(() => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = null;
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
    stopMeter();
  }, [stopMeter]);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || recRef.current) return;

    setError(null);
    finalRef.current = "";
    setInterim("");

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);

    rec.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const text = res[0]?.transcript ?? "";
        if (res.isFinal) finalRef.current += text + " ";
        else interimText += text;
      }
      setInterim(interimText);

      // Endpointing: every new result resets the clock. When it runs out,
      // the turn is over.
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        // Fold any trailing interim in — Chrome sometimes never finalises it.
        if (!finalRef.current.trim() && interimText.trim()) {
          finalRef.current = interimText;
        }
        stop();
        commit();
      }, ENDPOINT_SILENCE_MS);
    };

    rec.onerror = (e) => {
      if (e.error === "no-speech") setError("Didn't catch that — try again.");
      else if (e.error === "not-allowed")
        setError("Microphone permission denied.");
      else if (e.error !== "aborted") setError(`Mic error: ${e.error}`);
      stop();
    };

    rec.onend = () => {
      setListening(false);
      recRef.current = null;
      stopMeter();
    };

    recRef.current = rec;
    try {
      rec.start();
      startMeter();
    } catch {
      setError("Could not start the microphone.");
      recRef.current = null;
    }
  }, [commit, startMeter, stop, stopMeter]);

  const toggle = useCallback(() => {
    if (listening) {
      stop();
      commit();
    } else {
      start();
    }
  }, [listening, start, stop, commit]);

  // Tear everything down if the component unmounts mid-turn.
  useEffect(() => () => {
    recRef.current?.abort();
    stopMeter();
  }, [stopMeter]);

  return { supported, listening, interim, level, error, start, stop, toggle };
}

/** Strip markdown so TTS doesn't read punctuation aloud. */
export function stripForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " code block ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    .replace(/^\s*[-•*]\s+/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface SpeechOutput {
  supported: boolean;
  speaking: boolean;
  /** Feed streamed tokens; complete sentences are spoken as they arrive. */
  push: (chunk: string) => void;
  /** Flush whatever is left once the stream ends. */
  flush: () => void;
  cancel: () => void;
  reset: () => void;
}

/**
 * Incremental text-to-speech.
 *
 * The chat endpoint streams tokens, so rather than waiting for the whole reply
 * this speaks each sentence the moment it completes. First audio lands about a
 * sentence in instead of after the full generation — the same trick that makes
 * a voice agent feel responsive rather than turn-based.
 */
export function useSpeechOutput(enabled: boolean): SpeechOutput {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const bufferRef = useRef("");
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);

    const pick = () => {
      const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
      if (voices.length === 0) return;
      // Prefer a natural-sounding voice where one exists, else any English one.
      voiceRef.current =
        voices.find((v) => /natural|neural|premium|enhanced/i.test(v.name)) ??
        voices.find((v) => /google|samantha|serena|daniel/i.test(v.name)) ??
        voices[0];
    };
    pick();
    speechSynthesis.addEventListener("voiceschanged", pick);
    return () => speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);

  const say = useCallback((sentence: string) => {
    const clean = stripForSpeech(sentence);
    if (!clean) return;
    const u = new SpeechSynthesisUtterance(clean);
    if (voiceRef.current) u.voice = voiceRef.current;
    u.rate = 1.05;
    u.pitch = 1;
    u.onstart = () => setSpeaking(true);
    // Only clear the flag once nothing else is queued behind this utterance.
    u.onend = () => setSpeaking(speechSynthesis.pending || speechSynthesis.speaking);
    u.onerror = () => setSpeaking(false);
    speechSynthesis.speak(u);
  }, []);

  const push = useCallback(
    (chunk: string) => {
      if (!enabled || !("speechSynthesis" in window)) return;
      bufferRef.current += chunk;
      // Flush on sentence boundaries; keep the remainder buffered.
      const parts = bufferRef.current.split(/(?<=[.!?])\s+|\n+/);
      if (parts.length > 1) {
        bufferRef.current = parts.pop() ?? "";
        parts.forEach(say);
      }
    },
    [enabled, say]
  );

  const flush = useCallback(() => {
    if (!enabled || !("speechSynthesis" in window)) return;
    const rest = bufferRef.current;
    bufferRef.current = "";
    if (rest.trim()) say(rest);
  }, [enabled, say]);

  const cancel = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    bufferRef.current = "";
    speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const reset = useCallback(() => {
    bufferRef.current = "";
  }, []);

  // Never leave audio playing behind a closed panel or a navigation.
  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
  }, []);

  return { supported, speaking, push, flush, cancel, reset };
}
