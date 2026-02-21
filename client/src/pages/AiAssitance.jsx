import React, { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "ai_assist_messages_v1";

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
  const listRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
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
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 bg-gradient-to-br from-cyan-50 to-slate-100 rounded-xl shadow-lg mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyan-700">AI Assistance</h2>
        <button
          onClick={clearChat}
          className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium shadow"
        >
          Clear
        </button>
      </div>

      <div ref={listRef} className="h-96 overflow-y-auto border border-slate-200 rounded-lg bg-white p-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="text-slate-400 text-center">Start the conversation — ask a question or describe a problem.</div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              `flex ${m.sender === "user" ? "justify-end" : "justify-start"}`
            }
          >
            <div
              className={
                `max-w-[76%] px-4 py-2 rounded-lg shadow-sm whitespace-pre-wrap ` +
                (m.sender === "user"
                  ? "bg-cyan-600 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200")
              }
            >
              {m.text}
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
          placeholder="Type your message, press Enter to send"
          rows={3}
          className="w-full p-3 rounded-lg border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 resize-none text-base bg-slate-50 shadow"
        />
        <div className="flex items-center justify-end gap-2 mt-3">
          <button
            type="button"
            onClick={() => { setInput((s) => s + "\nExplain like I'm five."); }}
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
        Tip: Connect a backend at <code className="bg-slate-100 px-1 rounded">/api/ai-assist</code> that accepts JSON <code className="bg-slate-100 px-1 rounded">{'{ message: "..." }'}</code> and returns <code className="bg-slate-100 px-1 rounded">{'{ reply: "..." }'}</code>.
      </div>
    </div>
  );
}