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

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    Array.from(e.dataTransfer.files).forEach(file => onFileSelect(file));
  };

  const handleClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => onFileSelect(file));
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-colors
        ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}
        ${isProcessing ? "pointer-events-none opacity-60" : ""}
      `}
    >
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        accept="image/jpeg,image/png,application/pdf"
      />

      <div className="flex flex-col items-center pointer-events-none">
        <div className="p-4 bg-blue-50 rounded-full mb-4">
          <UploadCloud className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Upload your Telecom Bills
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
          Drag and drop one or more PDFs or Images, or click to browse.
        </p>
        <div className="flex gap-4 text-xs text-gray-400 font-medium uppercase tracking-wider">
          <span className="flex items-center gap-1"><FileType className="w-4 h-4" /> PDF</span>
          <span className="flex items-center gap-1"><FileImage className="w-4 h-4" /> PNG</span>
          <span className="flex items-center gap-1"><FileImage className="w-4 h-4" /> JPG</span>
        </div>
      </div>
    </div>
  );
}