"use client";

import { useState } from "react";
import DropzoneUI from "./DropzoneUI";
import ChatBarUI from "./ChatBarUI";
import { analyzeBillAction } from "@/actions/analyzeBill";
import { TelecomBillData } from "@/lib/schema";
import { MOCK_BILL_DATA } from "@/lib/mockdata";
import { AlertCircle } from "lucide-react";

export default function Workspace() {
  const isDev = process.env.NODE_ENV === "development";
  const [isProcessing, setIsProcessing] = useState(false);
  const [billData, setBillData] = useState<TelecomBillData | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setExtractionError(null);
    setUploadedFileName(file.name);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await analyzeBillAction(formData);
      if (response.success) {
        setBillData(response.data as TelecomBillData);
      } else {
        setExtractionError("We couldn't read your bill. Please try a clearer image or PDF.");
      }
    } catch (error) {
      console.error(error);
      setExtractionError("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadDemo = () => {
    setBillData(MOCK_BILL_DATA);
    setUploadedFileName("demo-airtel-bill.json");
  };

  const handleReset = () => {
    setBillData(null);
    setUploadedFileName("");
    setExtractionError(null);
  };

  return (
    <div className="flex-1 w-full max-w-3xl flex flex-col min-h-0">
      {!billData ? (
        // --- UPLOAD STATE ---
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col gap-4 w-full">
            <DropzoneUI
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
            />
            {extractionError && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{extractionError}</span>
              </div>
            )}
            {isDev && (
              <button
                onClick={handleLoadDemo}
                className="text-sm text-blue-600 underline text-center"
              >
                Skip extraction — Load demo bill
              </button>
            )}
          </div>
        </div>
      ) : (
        // --- CHAT STATE ---
        <ChatBarUI
          billData={billData}
          uploadedFileName={uploadedFileName}
          onReset={handleReset}
        />
      )}
    </div>
  );
}