import { useState, useRef, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { chatMessages as initialMessages } from "@/data/mockData";
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  textToSpeech,
  speechToText,
  LANGUAGES,
  type LanguageCode,
} from "@/lib/elevenlabsApi";
import { useToast } from "@/hooks/use-toast";

const quickPrompts = [
  "I have a headache and feel dizzy",
  "What do my latest vitals mean?",
  "Suggest exercises for lower back pain",
  "Am I at risk for diabetes?",
];

/** Generate a contextual bot reply based on user message (no LLM; responds accordingly) */
function getBotReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes("headache") || lower.includes("dizzy")) {
    return "I'm sorry to hear that. For headaches and dizziness, try resting in a quiet room and staying hydrated. If it's severe or persists, please see a doctor. I can also help you log symptoms if needed.";
  }
  if (lower.includes("vital") || lower.includes("vitals")) {
    return "Based on your dashboard, your recent vitals are within normal ranges. Keep monitoring them and share any concerns. Would you like me to explain any specific metric?";
  }
  if (lower.includes("exercise") || lower.includes("back pain")) {
    return "For lower back pain, gentle stretches and walking often help. Avoid heavy lifting. I recommend consulting a physiotherapist for a personalized plan. Would you like general stretching tips?";
  }
  if (lower.includes("diabetes") || lower.includes("risk")) {
    return "Risk depends on family history, lifestyle, and vitals. Your glucose trends on the dashboard are a good starting point. I recommend discussing a full risk assessment with your doctor.";
  }
  if (lower.includes("thank") || lower.includes("thanks")) {
    return "You're welcome! Feel free to ask anything else about your health or vitals.";
  }
  return "Thank you for sharing that. I've noted your message. For personalized medical advice, please consult your physician. Is there anything specific about your vitals or symptoms you'd like to explore?";
}

const VirtualAssistant = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [speakReplies, setSpeakReplies] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sttLoading, setSttLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const playTts = useCallback(
    async (text: string) => {
      if (!speakReplies || !text.trim()) return;
      stopAudio();
      try {
        setIsSpeaking(true);
        const blob = await textToSpeech(text, language);
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        audio.onended = () => {
          URL.revokeObjectURL(url);
          setIsSpeaking(false);
          currentAudioRef.current = null;
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          setIsSpeaking(false);
        };
        await audio.play();
      } catch (e) {
        setIsSpeaking(false);
        toast({
          title: "Voice playback failed",
          description: e instanceof Error ? e.message : "Could not play response.",
          variant: "destructive",
        });
      }
    },
    [language, speakReplies, stopAudio, toast]
  );

  const send = useCallback(
    async (textToSend?: string) => {
      const content = (textToSend ?? input).trim();
      if (!content) return;

      const userMsg = {
        id: messages.length + 1,
        sender: "user" as const,
        message: content,
      };
      const botMessage = getBotReply(content);
      const botMsg = {
        id: messages.length + 2,
        sender: "bot" as const,
        message: botMessage,
      };

      setMessages((prev) => [...prev, userMsg, botMsg]);
      setInput("");
      await playTts(botMessage);
    },
    [input, messages.length, playTts]
  );

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size < 100) {
          toast({ title: "No speech detected", description: "Try speaking longer.", variant: "destructive" });
          setSttLoading(false);
          return;
        }
        try {
          const result = await speechToText(blob, language);
          const text = (result?.text ?? "").trim();
          if (text) {
            setInput((prev) => (prev ? `${prev} ${text}` : text));
            toast({ title: "Voice transcribed", description: text.length > 60 ? `${text.slice(0, 60)}…` : text });
            setTimeout(() => inputRef.current?.focus(), 0);
          } else {
            toast({ title: "No text recognized", description: "Try speaking clearly.", variant: "destructive" });
          }
        } catch (e) {
          toast({
            title: "Speech recognition failed",
            description: e instanceof Error ? e.message : "Check your connection and try again.",
            variant: "destructive",
          });
        } finally {
          setSttLoading(false);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setSttLoading(true);
    } catch (e) {
      toast({
        title: "Microphone access denied",
        description: "Allow microphone access to use voice input.",
        variant: "destructive",
      });
      setSttLoading(false);
    }
  }, [language, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, [isRecording]);

  const toggleMic = useCallback(() => {
    if (isRecording) stopRecording();
    else startRecording();
  }, [isRecording, startRecording, stopRecording]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-10rem)] animate-fade-in">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold">AI Health Assistant</h1>
            <p className="text-muted-foreground text-sm">Chat with our AI for symptom triage and health guidance. Use voice in your language.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={(v) => setLanguage(v as LanguageCode)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(({ code, label }) => (
                  <SelectItem key={code} value={code}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSpeakReplies(!speakReplies)}
              title={speakReplies ? "Turn off spoken replies" : "Turn on spoken replies"}
            >
              {speakReplies ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
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
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                  m.sender === "bot" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent"
                )}
              >
                {m.sender === "bot" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line",
                  m.sender === "bot"
                    ? "bg-card border border-border rounded-tl-sm"
                    : "bg-primary text-primary-foreground rounded-tr-sm"
                )}
              >
                {m.message}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-xl h-12 w-12 shrink-0",
              isRecording && "bg-destructive/10 border-destructive/30"
            )}
            onClick={toggleMic}
            disabled={isSpeaking}
            title={isRecording ? "Stop recording" : sttLoading ? "Processing…" : "Voice input (speech to text)"}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5 text-destructive" />
            ) : sttLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-busy />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type or use mic... Describe your symptoms..."
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 border border-transparent focus:border-primary/30 transition-all"
          />
          <Button
            onClick={() => send()}
            size="icon"
            className="rounded-xl h-12 w-12 shrink-0"
            disabled={!input.trim() || isSpeaking}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {(isSpeaking || sttLoading) && (
          <p className="text-muted-foreground text-xs mt-1">
            {isSpeaking ? "Speaking…" : isRecording ? "Recording…" : "Processing speech…"}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VirtualAssistant;
