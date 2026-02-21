import React, { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "ai_assist_messages_v1";
const LANGUAGE_STORAGE_KEY = "ai_assist_language_v1";

// ISO 639-1 codes supported by ElevenLabs multilingual TTS/STT
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "pl", label: "Polish" },
  { code: "tr", label: "Turkish" },
  { code: "ru", label: "Russian" },
  { code: "nl", label: "Dutch" },
  { code: "cs", label: "Czech" },
  { code: "ar", label: "Arabic" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "hi", label: "Hindi" },
  { code: "ko", label: "Korean" },
];

function generateBotReply(userText) {
  const t = userText.trim().toLowerCase();
  if (!t) return "Can you please provide more details?";
  if (t.includes("help") || t.includes("assist")) {
    return (
      "Sure — tell me what you're trying to do and I can suggest steps, code examples, or resources."
    );
  }
  if (t.includes("error") || t.includes("bug")) {
    return (
      "I can help debug — please paste the error message and a short code sample so I can analyse it."
    );
  }
  if (t.length < 20) {
    return "Thanks — can you give a bit more context so I can provide a useful answer?";
  }
  return (
    "I don't have a backend configured here — this is a local fallback reply. If you connect an AI API at '/api/ai-assist' the assistant will return richer answers. Meanwhile: " +
    "Here's a suggestion based on your input: try breaking the problem into smaller steps and sharing what you've tried."
  );
}

export default function AiAssitance() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [languageCode, setLanguageCode] = useState("en");
  const [ttsPlayingId, setTtsPlayingId] = useState(null);
  const [recording, setRecording] = useState(false);
  const [ttsError, setTtsError] = useState(null);
  const [sttError, setSttError] = useState(null);
  const listRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
      const lang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (lang) setLanguageCode(lang);
    } catch (e) {
      console.warn("Failed to load messages", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn("Failed to save messages", e);
    }
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    } catch (e) {}
  }, [languageCode]);

  async function playTts(text, messageId) {
    if (!text || ttsPlayingId) return;
    setTtsError(null);
    setTtsPlayingId(messageId);
    try {
      const res = await fetch("/api/elevenlabs/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, languageCode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `TTS failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setTtsPlayingId(null);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setTtsPlayingId(null);
        setTtsError("Playback failed.");
      };
      await audio.play();
    } catch (err) {
      setTtsPlayingId(null);
      setTtsError(err.message || "Text-to-speech failed. Set ELEVENLABS_API_KEY on the server.");
    }
  }

  const stopTts = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setTtsPlayingId(null);
  }, []);

  async function startRecording() {
    setSttError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        const form = new FormData();
        form.append("audio", blob, "recording.webm");
        form.append("languageCode", languageCode);
        try {
          const res = await fetch("/api/elevenlabs/stt", {
            method: "POST",
            body: form,
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Transcription failed.");
          if (data.text) setInput((prev) => (prev ? `${prev} ${data.text}` : data.text).trim());
          else setSttError("No speech detected.");
        } catch (err) {
          setSttError(err.message || "Speech-to-text failed. Set ELEVENLABS_API_KEY on the server.");
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      setSttError("Microphone access denied or unavailable.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setRecording(false);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: Date.now() + "u", sender: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        const reply = data && (data.reply || data.answer || data.text);
        if (reply) {
          setMessages((m) => [...m, { id: Date.now() + "b", sender: "bot", text: String(reply) }]);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      // fall back to local reply
    }

    const fallback = generateBotReply(text);
    setMessages((m) => [...m, { id: Date.now() + "b", sender: "bot", text: fallback }]);
    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    stopTts();
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 bg-gradient-to-br from-cyan-50 to-slate-100 rounded-xl shadow-lg mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-cyan-700">AI Assistance</h2>
        <div className="flex items-center gap-2">
          <label className="text-slate-600 text-sm font-medium">Language</label>
          <select
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200"
          >
            {LANGUAGES.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={clearChat}
            className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium shadow"
          >
            Clear
          </button>
        </div>
      </div>

      {(ttsError || sttError) && (
        <div className="mb-3 rounded bg-amber-50 border border-amber-200 px-3 py-2 text-amber-800 text-sm">
          {ttsError && <p>{ttsError}</p>}
          {sttError && <p>{sttError}</p>}
        </div>
      )}

      <div ref={listRef} className="h-96 overflow-y-auto border border-slate-200 rounded-lg bg-white p-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="text-slate-400 text-center">
            Type a message, use the microphone to speak, or select a language for voice input/output.
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={
                `max-w-[76%] px-4 py-2 rounded-lg shadow-sm whitespace-pre-wrap flex items-center gap-2 ` +
                (m.sender === "user"
                  ? "bg-cyan-600 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200")
              }
            >
              <span>{m.text}</span>
              {m.sender === "bot" && (
                <button
                  type="button"
                  onClick={() => (ttsPlayingId === m.id ? stopTts() : playTts(m.text, m.id))}
                  className="shrink-0 p-1 rounded hover:bg-slate-200/80 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  title={ttsPlayingId === m.id ? "Stop" : "Listen"}
                  aria-label={ttsPlayingId === m.id ? "Stop playback" : "Play reply with voice"}
                >
                  {ttsPlayingId === m.id ? (
                    <span className="text-xs font-bold">⏹</span>
                  ) : (
                    <span className="text-sm" aria-hidden>🔊</span>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-slate-400 animate-pulse">Assistant is typing...</div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        className="mt-6"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message or use the microphone to speak (language above)"
          rows={3}
          className="w-full p-3 rounded-lg border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 resize-none text-base bg-slate-50 shadow"
        />
        <div className="flex items-center justify-end gap-2 mt-3">
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            className={`px-3 py-2 rounded font-medium shadow text-sm flex items-center gap-1.5 ${
              recording
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-slate-200 hover:bg-slate-300 text-slate-700"
            }`}
            title={recording ? "Stop recording" : "Start voice input"}
          >
            {recording ? "⏹ Stop" : "🎤 Speak"}
          </button>
          <button
            type="button"
            onClick={() => setInput((s) => s + "\nExplain like I'm five.")}
            className="px-3 py-1 rounded bg-cyan-100 hover:bg-cyan-200 text-cyan-700 text-sm font-semibold shadow"
          >
            ELI5
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow disabled:bg-cyan-300"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
      <div className="mt-6 text-slate-400 text-xs text-center">
        Voice: ElevenLabs TTS/STT. Set <code className="bg-slate-100 px-1 rounded">ELEVENLABS_API_KEY</code> in the server <code className="bg-slate-100 px-1 rounded">.env</code>.
      </div>
    </div>
  );
}
