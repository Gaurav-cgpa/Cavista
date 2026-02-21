import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { chatMessages as initialMessages } from "@/data/mockData";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const quickPrompts = [
  "I have a headache and feel dizzy",
  "What do my latest vitals mean?",
  "Suggest exercises for lower back pain",
  "Am I at risk for diabetes?",
];

const VirtualAssistant = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { id: messages.length + 1, sender: "user" as const, message: input };
    setMessages([...messages, userMsg, {
      id: messages.length + 2,
      sender: "bot" as const,
      message: "Thank you for sharing that. Based on your symptoms and recent vitals data, I'd recommend monitoring your condition and staying hydrated. If symptoms persist beyond 48 hours, please consult your physician.",
    }]);
    setInput("");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-10rem)] animate-fade-in">
        <div className="mb-4">
          <h1 className="font-display text-2xl font-bold">AI Health Assistant</h1>
          <p className="text-muted-foreground text-sm">Chat with our AI for symptom triage and health guidance.</p>
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => setInput(p)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto space-y-4 pr-2">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex gap-3", m.sender === "user" && "flex-row-reverse")}>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                m.sender === "bot" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent"
              )}>
                {m.sender === "bot" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className={cn(
                "max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line",
                m.sender === "bot"
                  ? "bg-card border border-border rounded-tl-sm"
                  : "bg-primary text-primary-foreground rounded-tr-sm"
              )}>
                {m.message}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Describe your symptoms..."
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 border border-transparent focus:border-primary/30 transition-all"
          />
          <Button onClick={send} size="icon" className="rounded-xl h-12 w-12">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VirtualAssistant;
