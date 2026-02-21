const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";
const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"; // Multilingual-friendly default
const DEFAULT_TTS_MODEL = "eleven_multilingual_v2";
const DEFAULT_STT_MODEL = "scribe_v2";

function getApiKey() {
  const key = process.env.ELEVENLABS_API_KEY || process.env.XI_API_KEY;
  if (!key) {
    throw new Error("ELEVENLABS_API_KEY (or XI_API_KEY) is not set in environment.");
  }
  return key;
}

/**
 * Convert text to speech (TTS)
 * @param {string} text - Text to speak
 * @param {Object} options - { languageCode (ISO 639-1), voiceId, outputFormat }
 * @returns {Promise<Buffer>} - Audio buffer (e.g. mp3)
 */
export async function textToSpeech(text, options = {}) {
  const apiKey = getApiKey();
  const voiceId = options.voiceId || DEFAULT_VOICE_ID;
  const languageCode = options.languageCode || "en";
  const outputFormat = options.outputFormat || "mp3_44100_128";

  const url = `${ELEVENLABS_BASE}/text-to-speech/${voiceId}?output_format=${outputFormat}`;
  const body = {
    text: String(text),
    model_id: DEFAULT_TTS_MODEL,
    language_code: languageCode,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
      Accept: "audio/mpeg",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ElevenLabs TTS failed (${res.status}): ${errText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Convert speech to text (STT)
 * @param {Buffer|Blob} audioBuffer - Audio file buffer
 * @param {Object} options - { languageCode (optional, ISO 639-1), modelId }
 * @returns {Promise<{ text: string, languageCode?: string }>}
 */
export async function speechToText(audioBuffer, options = {}) {
  const apiKey = getApiKey();
  const modelId = options.modelId || DEFAULT_STT_MODEL;
  const languageCode = options.languageCode || null;

  const form = new FormData();
  form.append("model_id", modelId);
  form.append("file", new Blob([audioBuffer]), "audio.webm");

  if (languageCode) {
    form.append("language_code", languageCode);
  }

  const res = await fetch(`${ELEVENLABS_BASE}/speech-to-text`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
    },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ElevenLabs STT failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.text != null ? String(data.text).trim() : "";
  const language_code = data.language_code || undefined;
  return { text, languageCode: language_code };
}
