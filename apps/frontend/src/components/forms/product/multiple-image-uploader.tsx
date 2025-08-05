/* --------------------------------------------------------------------------
 * MultiImageUploader – reusable drag‑and‑drop component for multiple images
 * --------------------------------------------------------------------------
 * Features
 *   • Drop zone + fallback input (click to browse)
 *   • Supports drag‑and‑drop or click‑to‑browse for multiple images
 *   • Shows image previews in a horizontally‑scrollable list (mobile) or grid
 *   • Allows removing individual images
 *   • Validates file type & max size (5 MB default) and optional max count
 *   • Handles async upload (e.g. S3) but works with data‑URLs until upload completes
 *   • Designed to play nicely with react‑hook‑form
 * -------------------------------------------------------------------------- */

"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import clsx from "clsx";
import { uploadFileToS3 } from "@/utils/image-upload";

export interface MultiImageUploaderProps {
  /** Existing image URLs (useful in edit mode) */
  value: (string | File)[];
  /** Called whenever the image list changes */
  onChange: (
    items: (string | File)[] | ((prev: (string | File)[]) => (string | File)[])
  ) => void;
  /** Optional: Called when the first image changes (for image_url field) */
  onFirstImageChange?: (firstImage: string | File | null) => void;
  /** Disable all interactivity */
  disabled?: boolean;
  /** Minimum images required (for UI hint only) */
  minImages?: number;
  /** Maximum images allowed */
  maxImages?: number;
  /** Max file size in bytes (default 5 MB) */
  maxFileSize?: number;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  value,
  onChange,
  onFirstImageChange,
  disabled = false,
  minImages = 4,
  maxImages = 10,
  maxFileSize = 5 * 1024 * 1024,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Map<number, string>>(
    new Map()
  );

  /* ------------------------------------------------------------------ */
  /* helpers                                                             */
  /* ------------------------------------------------------------------ */
  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) return "Only image files are allowed";
    if (file.size > maxFileSize) return "File must be smaller than 5 MB";
    return null;
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newItems: File[] = [];

      for (const file of Array.from(files)) {
        const error = validateFile(file);
        if (error) {
          alert(error);
          continue;
        }
        if (value.length + newItems.length >= maxImages) {
          alert(`Maximum of ${maxImages} images reached`);
          break;
        }

        newItems.push(file);
      }

      if (newItems.length) {
        const updatedImages = [...value, ...newItems];
        onChange(updatedImages);

        // Update first image if callback is provided and we have images
        if (onFirstImageChange && updatedImages.length > 0) {
          onFirstImageChange(updatedImages[0]);
        }
      }
    },
    [value, onChange, onFirstImageChange, maxImages, validateFile]
  );

  const removeAt = (index: number) => {
    if (disabled) return;

    // Clean up preview URL if it's a File
    const item = value[index];
    if (item instanceof File) {
      const previewUrl = previewUrls.get(index);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrls((prev) => {
          const newMap = new Map(prev);
          newMap.delete(index);
          return newMap;
        });
      }
    }

    const updatedImages = value.filter((_, i) => i !== index);
    onChange(updatedImages);

    // Update first image if callback is provided
    if (onFirstImageChange) {
      const newFirstImage = updatedImages.length > 0 ? updatedImages[0] : null;
      onFirstImageChange(newFirstImage);
    }
  };

  // Create preview URLs for File objects
  React.useEffect(() => {
    const newPreviewUrls = new Map<number, string>();

    value.forEach((item, index) => {
      if (item instanceof File && !previewUrls.has(index)) {
        const previewUrl = URL.createObjectURL(item);
        newPreviewUrls.set(index, previewUrl);
      }
    });

    if (newPreviewUrls.size > 0) {
      setPreviewUrls((prev) => new Map([...prev, ...newPreviewUrls]));
    }

    // Cleanup function
    return () => {
      newPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [value]);

  // Get display URL for an item
  const getDisplayUrl = (item: string | File, index: number): string => {
    if (typeof item === "string") {
      return item; // Already a URL
    }
    return previewUrls.get(index) || ""; // File preview URL
  };

  /* ------------------------------------------------------------------ */
  /* render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <div className="flex flex-col gap-4">
      {/* drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsHovering(true);
        }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsHovering(false);
          if (disabled) return;
          handleFiles(e.dataTransfer.files);
        }}
        className={clsx(
          "w-full h-32 flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          disabled
            ? "border-transparent bg-gray-50"
            : isHovering
            ? "border-gray-300 bg-gray-50"
            : "border-gray-200 bg-white hover:border-gray-300 cursor-pointer"
        )}
      >
        <Upload className="h-6 w-6 text-gray-400" />
        <p className="mt-1 text-xs text-gray-500 text-center px-2">
          Drop your image here, or <br />{" "}
          <span className="text-blue-500">click to browse</span>
        </p>
      </div>

      {/* Pinterest-style masonry grid */}
      <div className="columns-2 gap-2 space-y-2">
        {value.map((item, i) => {
          const displayUrl = getDisplayUrl(item, i);
          const isFile = item instanceof File;

          return (
            <div
              key={i}
              className="relative break-inside-avoid mb-2 group border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {displayUrl ? (
                <img
                  src={displayUrl}
                  alt={`Product ${i + 1}`}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                  <div className="text-gray-400 text-sm">Loading...</div>
                </div>
              )}

              {/* File indicator */}
              {isFile && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                  New
                </div>
              )}

              {/* remove button */}
              {!disabled && (
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => removeAt(i)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-white/80 backdrop-blur hover:bg-white shadow hidden group-hover:block"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
};
