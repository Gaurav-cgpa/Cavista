/**
 * Client for ElevenLabs TTS/STT via our backend.
 * In dev, Vite proxies /api to http://localhost:5000 (see vite.config.ts).
 * Set VITE_API_URL in .env to override (e.g. production API URL).
 */

const getBaseUrl = () => {
  return "http://localhost:3001"
};

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" }
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

/** Text-to-speech: get audio blob for the given text and language */
export async function textToSpeech(
  text: string,
  languageCode: string = "en"
): Promise<Blob> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/elevenlabs/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, languageCode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `TTS failed: ${res.status}`);
  }
  return res.blob();
}

/** Speech-to-text: send audio file, get { text, languageCode } */
export async function speechToText(
  audioBlob: Blob,
  languageCode?: string | null
): Promise<{ text: string; languageCode?: string }> {
  const base = getBaseUrl();
  const form = new FormData();
  form.append("audio", audioBlob, "audio.webm");
  if (languageCode) {
    form.append("languageCode", languageCode);
  }
  const res = await fetch(`${base}/api/elevenlabs/stt`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `STT failed: ${res.status}`);
  }
  return res.json();
}
