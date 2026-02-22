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
  translate,
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

/** Call backend API to get chatbot reply - NO HARDCODED FALLBACK */
async function getChatbotReply(userMessage: string, userId?: string, language?: string): Promise<string> {
  const baseUrl = "http://localhost:3001";
  
  // Get bearer token from local storage
  const bearerToken = localStorage.getItem("healthai_token");
  if (!bearerToken) {
    throw new Error("Not authenticated. Please login first.");
  }
  
  console.log("🤖 Calling backend chat API...");
  console.log("🔐 Token retrieved from localStorage (length):", bearerToken?.length || 0, "chars");
  console.log("🔐 Token preview:", bearerToken?.substring(0, 20) + "...");
  console.log("🌐 Language preference:", language || "en");
  
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      message: userMessage, 
      userId: userId || undefined,
      bearerToken,
      language: language || "en",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Chat failed: ${res.status}`);
  }

  const data = await res.json();
  if (!data.reply) {
    throw new Error("No reply in API response");
  }

  console.log("✅ Got API reply:", data.reply);
  return String(data.reply).trim();
}

const VirtualAssistant = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [speakReplies, setSpeakReplies] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sttLoading, setSttLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

      // Add user message immediately
      setMessages((prev) => [...prev, userMsg]);
      setInput("");

      // Show loading indicator
      setIsLoading(true);

      let displayBotMessage = "";
      try {
        // Always prepare content in English for API
        let contentForApi = content;
        if (language === "hi") {
          try {
            console.log("🌐 Hindi selected - translating user input to English for API");
            contentForApi = await translate(content, "en", "hi");
            console.log("📝 Translated Hindi→English:", contentForApi);
          } catch (e) {
            console.error("Translation error:", e);
            contentForApi = content;
          }
        } else {
          console.log("🌐 English selected - sending English to API");
        }

        // Call backend API with language preference - expects English input, returns response
        console.log("🤖 Calling backend chat API with language:", language);
        const botMessage = await getChatbotReply(contentForApi, undefined, language);
        console.log("✅ Got API reply (should be in selected language):", botMessage);

        // Process response based on selected language
        displayBotMessage = botMessage;
        
        // ALWAYS check if response is in the correct language and translate if needed
        const hindiCharRegex = /[\u0900-\u097F]/; // Hindi Unicode range
        const responseIsHindi = hindiCharRegex.test(botMessage);
        const responseIsEnglish = !responseIsHindi; // If not Hindi, assume English
        
        console.log("🔍 Response language detection:", responseIsHindi ? "Hindi" : "English");
        console.log("🎯 Selected language:", language === "hi" ? "Hindi" : "English");
        
        // Check if response matches selected language
        if (language === "en" && responseIsHindi) {
          // English selected but got Hindi - translate to English
          try {
            console.log("🌐 Got Hindi response but English selected - translating to English");
            displayBotMessage = await translate(botMessage, "en", "hi");
            console.log("📝 Translated Hindi→English:", displayBotMessage);
          } catch (e) {
            console.error("Translation error:", e);
            displayBotMessage = botMessage; // Keep original if translation fails
          }
        } else if (language === "hi" && responseIsEnglish) {
          // Hindi selected but got English - translate to Hindi
          try {
            console.log("🌐 Got English response but Hindi selected - translating to Hindi");
            displayBotMessage = await translate(botMessage, "hi", "en");
            console.log("📝 Translated English→Hindi:", displayBotMessage);
          } catch (e) {
            console.error("Translation error:", e);
            displayBotMessage = botMessage; // Keep original if translation fails
          }
        } else {
          console.log("✅ Response already in correct language");
        }
      } catch (err) {
        // Show error message from API
        displayBotMessage = `Error: ${err instanceof Error ? err.message : "Chat API failed. Please try again."}`;
        console.error("❌ Chat failed:", displayBotMessage);
        toast({
          title: "Chat Error",
          description: displayBotMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }

      const botMsg = {
        id: messages.length + 2,
        sender: "bot" as const,
        message: displayBotMessage,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Play response in selected language (if available)
      if (displayBotMessage && !displayBotMessage.startsWith("Error:")) {
        await playTts(displayBotMessage);
      }
    },
    [input, language, messages.length, playTts, toast]
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
          let text = (result?.text ?? "").trim();
          
          if (text) {
            setInput((prev) => (prev ? `${prev} ${text}` : text));
            toast({ 
              title: "Voice transcribed", 
              description: text.length > 60 ? `${text.slice(0, 60)}…` : text 
            });
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
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Thinking</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
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
            disabled={isSpeaking || isLoading}
            title={isRecording ? "Stop recording" : sttLoading ? "Processing…" : isLoading ? "Waiting for response..." : "Voice input (speech to text)"}
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
            onKeyDown={(e) => e.key === "Enter" && !isLoading && send()}
            placeholder="Type or use mic... Describe your symptoms..."
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 border border-transparent focus:border-primary/30 transition-all"
            disabled={isLoading}
          />
          <Button
            onClick={() => send()}
            size="icon"
            className="rounded-xl h-12 w-12 shrink-0"
            disabled={!input.trim() || isSpeaking || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        {(isSpeaking || sttLoading || isLoading) && (
          <p className="text-muted-foreground text-xs mt-1">
            {isSpeaking ? "Speaking…" : isRecording ? "Recording…" : isLoading ? "⏳ Waiting for AI response..." : "Processing speech…"}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VirtualAssistant;
