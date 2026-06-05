"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, RotateCcw, FileText, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface BillItem {
  billId: string;
  fileName: string;
  status: "processing" | "ready" | "error";
}

interface ChatBarUIProps {
  bills: BillItem[];
  onReset: () => void;
}

export default function ChatBarUI({ bills, onReset }: ChatBarUIProps) {
  const [localInput, setLocalInput] = useState<string>("");

  const suggestions =
    bills.length > 1
      ? [
          "Compare charges across all my bills",
          "Which month had the highest bill?",
          "Have my charges increased over time?",
          "Show all late payment charges mentioned",
        ]
      : [
          "What is my total amount due?",
          "When is my payment due?",
          "Break down my charges",
          "Are there any late fee charges?",
        ];

  const { messages, sendMessage, status, error, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;
    await sendMessage({ text });
    setLocalInput("");
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(localInput);
    setLocalInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSubmit(suggestion);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* Bill list header */}
        <div className="flex justify-end">
          <div className="max-w-[85%] bg-slate-900 text-white rounded-2xl rounded-br-none px-5 py-4 text-sm shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                  {bills.length} Bill{bills.length > 1 ? "s" : ""} Ready
                </p>
                <p className="font-semibold text-base">Ask me anything!</p>
              </div>
              <button
                onClick={onReset}
                className="text-slate-400 hover:text-white transition-colors ml-4"
                title="Upload new bills"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="border-t border-slate-700 pt-3 flex flex-col gap-2">
              {bills.map((bill) => (
                <div key={bill.billId} className="flex items-center gap-2">
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-300 text-xs truncate">
                    {bill.fileName}
                  </span>
                  <CheckCircle className="w-3 h-3 text-green-400 shrink-0 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Suggested prompts */}
        {messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-400 text-center">
              Suggested questions
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded-full text-sm text-slate-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                m.role === "user"
                  ? "bg-slate-900 text-white rounded-br-none"
                  : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
              }`}
            >
              {m.parts?.map((part, i) =>
                part.type === "text" ? (
                  <div
                    key={i}
                    className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0"
                  >
                    <ReactMarkdown>{part.text}</ReactMarkdown>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error bar */}
      {error && (
        <div className="flex items-center justify-between gap-3 bg-red-50 border-t border-red-200 text-red-700 px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Something went wrong. Please try again.</span>
          </div>
          <button
            onClick={() => regenerate()}
            className="text-red-600 underline text-xs shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-100 bg-white px-4 py-3">
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-slate-400"
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about your bills..."
          />
          <button
            type="submit"
            disabled={isLoading || !localInput.trim()}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:bg-slate-300 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
