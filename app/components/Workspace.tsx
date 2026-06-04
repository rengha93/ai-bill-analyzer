"use client";

import { useState, useEffect } from "react";
import DropzoneUI from "./DropzoneUI";
import ChatBarUI from "./ChatBarUI";
import { AlertCircle, CheckCircle, Loader2, FileText } from "lucide-react";
import { embedBillAction } from "@/actions/embedBills";

interface BillItem {
  billId: string;
  fileName: string;
  status: "processing" | "ready" | "error";
}

export default function Workspace() {
  const [bills, setBills] = useState<BillItem[]>([]);
  const [allReady, setAllReady] = useState(false);

  // Check if all bills are ready
  useEffect(() => {
    if (bills.length > 0 && bills.every(b => b.status === "ready")) {
      setAllReady(true);
    } else {
      setAllReady(false);
    }
  }, [bills]);

  const handleFileSelect = async (file: File) => {
    const billId = `bill_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Add bill as processing
    setBills(prev => [...prev, {
      billId,
      fileName: file.name,
      status: "processing"
    }]);

    try {
      const embedFormData = new FormData();
      embedFormData.append("file", file);
      embedFormData.append("billId", billId);

      const embedResponse = await embedBillAction(embedFormData);

      // Update status
      setBills(prev => prev.map(b =>
        b.billId === billId
          ? { ...b, status: embedResponse.success ? "ready" : "error" }
          : b
      ));
    } catch (error) {
      console.error(error);
      setBills(prev => prev.map(b =>
        b.billId === billId ? { ...b, status: "error" } : b
      ));
    }
  };

  const handleReset = () => {
    setBills([]);
    setAllReady(false);
  };

  return (
    <div className="flex-1 w-full max-w-3xl flex flex-col min-h-0">
      {!allReady ? (
        // --- UPLOAD STATE ---
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col gap-4 w-full">
            <DropzoneUI
              onFileSelect={handleFileSelect}
              isProcessing={bills.some(b => b.status === "processing")}
            />

            {/* Bill processing list */}
            {bills.length > 0 && (
              <div className="flex flex-col gap-2">
                {bills.map(bill => (
                  <div
                    key={bill.billId}
                    className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
                  >
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="flex-1 text-slate-700 truncate">{bill.fileName}</span>
                    {bill.status === "processing" && (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                    )}
                    {bill.status === "ready" && (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    )}
                    {bill.status === "error" && (
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <span className={`text-xs shrink-0 ${
                      bill.status === "processing" ? "text-blue-500" :
                      bill.status === "ready" ? "text-green-500" : "text-red-500"
                    }`}>
                      {bill.status === "processing" ? "Processing..." :
                       bill.status === "ready" ? "Ready" : "Failed"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // --- CHAT STATE ---
        <ChatBarUI
          bills={bills}
          onReset={handleReset}
        />
      )}
    </div>
  );
}