// components/LogoCell.tsx
"use client";

import React, { useState } from "react";
import { Upload as UploadIcon } from "lucide-react";
import { TableCell } from "@/components/ui/table"; // adjust if your path differs

type LogoValue = string | File | null;

interface RowData {
  artworkURL: LogoValue;
  actionEdit: boolean;
}

interface Props {
  data: RowData;
  index: number;
  /** Persist the chosen file / url to parent state */
  onChange: (value: LogoValue, rowIndex: number) => void;
}

export const LogoCell: React.FC<Props> = ({ data, index, onChange }) => {
  const [dragOver, setDragOver] = useState(false);
  // console.log("data", data);
  /* ───────── helpers ───────── */
  const handleFile = (file: File) => onChange(file, index);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    e.dataTransfer.files?.[0] && handleFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("e", e.target.files);
    e.target.files?.[0] && handleFile(e.target.files[0]);
  };

  /* ───────── preview ───────── */
  const renderPreview = () => {
    if (!data.artworkURL) return "No Logo";

    if (typeof data.artworkURL === "string") {
      return (
        <img
          src={data.artworkURL}
          alt="Logo preview"
          className="w-full h-full object-cover rounded"
        />
      );
    }

    if ((data.artworkURL as File).type.startsWith("image/")) {
      const url = URL.createObjectURL(data.artworkURL as File);
      return (
        <img
          src={url}
          alt="Logo preview"
          className="w-full h-full object-cover rounded"
        />
      );
    }

    /* pdf fallback */
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <svg
          className="w-4 h-4 text-red-500 mb-1"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-[8px] text-gray-500">PDF</p>
      </div>
    );
  };

  /* ───────── view ───────── */
  return (
    <>
      {data.actionEdit ? (
        <div className="flex items-stretch gap-3 h-26">
          {/* upload zone */}
          <div
            className={`flex-1 relative border-2 border-dashed rounded-lg p-1 sm:p-2 transition-colors duration-200 ${
              dragOver
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
            }`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center h-full py-1 sm:py-2 text-center">
              <p
                className={`text-xs font-medium mb-0.5 hidden sm:block ${
                  dragOver
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {dragOver ? "Drop file here" : "Drag file here"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 hidden sm:block">
                or
              </p>
              <label className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30 cursor-pointer shadow-sm transition-colors">
                Browse
                <input
                  className="hidden"
                  accept="image/*,.pdf"
                  type="file"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </div>

          {/* preview */}
          <div className="w-20">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 h-full flex items-center justify-center">
              <div className="text-center p-1 sm:p-2">{renderPreview()}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-20">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 h-full flex items-center justify-center">
            <div className="text-center p-1 sm:p-2">{renderPreview()}</div>
          </div>
        </div>
      )}
    </>
  );
};
