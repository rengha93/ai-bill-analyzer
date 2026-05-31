"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { TelecomBillData } from "@/lib/schema";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ChatBarUIProps {
  billData: TelecomBillData;
  uploadedFileName: string;
  onReset: () => void;
}

// Compact bill summary card — rendered as first "message" in chat
function BillSummaryCard({
  data,
  fileName,
  onReset,
}: {
  data: TelecomBillData;
  fileName: string;
  onReset: () => void;
}) {
  return (
    <div className="flex justify-end mb-2">
      <div className="max-w-[85%] bg-slate-900 text-white rounded-2xl rounded-br-none px-5 py-4 text-sm shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
              Bill Analyzed
            </p>
            <p className="font-semibold text-base">
              {data.providerDetails.name}
            </p>
            <p className="text-slate-400 text-xs mt-0.5">{fileName}</p>
          </div>
          <button
            onClick={onReset}
            className="text-slate-400 hover:text-white transition-colors ml-4"
            title="Upload new bill"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-xs">Total Due</p>
            <p className="text-xl font-bold">
              ₹{data.financialSummary.totalAmountDue.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs">Due Date</p>
            <p className="text-red-400 font-semibold">
              {data.billingMetadata.dueDate}
            </p>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-3 mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div>
            <span className="text-slate-500">Plan: </span>
            {data.planDetails.planName}
          </div>
          <div>
            <span className="text-slate-500">Speed: </span>
            {data.planDetails.speed ?? "N/A"}
          </div>
          <div>
            <span className="text-slate-500">Account: </span>
            {data.customerInfo.accountNumber}
          </div>
          <div>
            <span className="text-slate-500">Period: </span>
            {data.billingMetadata.billingPeriod.start} –{" "}
            {data.billingMetadata.billingPeriod.end}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatBarUI({
  billData,
  uploadedFileName,
  onReset,
}: ChatBarUIProps) {
  const [localInput, setLocalInput] = useState<string>("");

  const { messages, sendMessage, status, error, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages,
          billContext: billData,
        },
      }),
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInput.trim() || isLoading) return;

    await sendMessage(
      { text: localInput },
      { body: { billContext: billData } },
    );

    setLocalInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* Bill summary card as first message */}
        <BillSummaryCard
          data={billData}
          fileName={uploadedFileName}
          onReset={onReset}
        />

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-slate-500 shadow-sm">
              Your bill is ready! Ask me anything about it.
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
                part.type === "text" ? <span key={i}>{part.text}</span> : null,
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

      {/* Input — fixed at bottom */}
      <div className="border-t border-slate-100 bg-white px-4 py-3">
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-slate-400"
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about this bill..."
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
