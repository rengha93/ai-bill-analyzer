"use client";

import { FileImage, FileType, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

interface DropzoneUIProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function DropzoneUI({ onFileSelect, isProcessing }: DropzoneUIProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (isProcessing) {
    return (
      <div className="p-12 border-2 border-dashed border-blue-300 bg-blue-50 rounded-2xl">
        <div className="flex flex-col items-center">
          
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <UploadCloud className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          <h3 className="text-xl font-semibold text-blue-800 mb-2">
            Analyzing your bill...
          </h3>
          <p className="text-sm text-blue-500 text-center max-w-sm mb-4">
            We are analyzing your bill. This may take a few seconds.
          </p>

          <div className="flex gap-1.5">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-colors
        ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}
      `}
    >
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,application/pdf"
      />

      <div className="flex flex-col items-center pointer-events-none">
        <div className="p-4 bg-blue-50 rounded-full mb-4">
          <UploadCloud className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Upload your Telecom Bill
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
          Drag and drop your PDF or Image here, or click to browse files.
        </p>
        <div className="flex gap-4 text-xs text-gray-400 font-medium uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <FileType className="w-4 h-4" /> PDF
          </span>
          <span className="flex items-center gap-1">
            <FileImage className="w-4 h-4" /> PNG
          </span>
          <span className="flex items-center gap-1">
            <FileImage className="w-4 h-4" /> JPG
          </span>
        </div>
      </div>
    </div>
  );
}