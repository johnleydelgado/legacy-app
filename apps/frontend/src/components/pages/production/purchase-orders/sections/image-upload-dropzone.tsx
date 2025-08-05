'use client';

import * as React from 'react';
import Image from 'next/image';

import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, X, CheckCircle, AlertCircle, Loader2, File } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "../../../../ui/select";
import ImageGallerySelect from "../../../../custom/select/image-gallery-select";

// Create an extended File interface with the additional properties
export interface ExtendedFile extends File {
    id: string;
    preview: string | null;
    url?: string;
    typeImage: string;
}

interface ComponentProps {
    currentItemIndex: number;
    onSaveImages: (files: ExtendedFile[], index: number) => void;
}

export default function ImageUploadDropzone({ currentItemIndex, onSaveImages }: ComponentProps) {
    const [files, setFiles] = React.useState<ExtendedFile[]>([]);

    // Enhanced onDrop with better error handling
    const onDrop = React.useCallback((acceptedFiles: File[]) => {
        // Create a safer preview URL approach
        const newFiles: ExtendedFile[] = acceptedFiles.map(file => {
            // Ensure the file is an image file
            if (!file.type.startsWith('image/')) {
                return Object.assign(file, {
                    preview: null, // No preview for non-image files
                    id: `${file.name}-${Date.now()}`,
                    typeImage: 'LOGO'
                }) as ExtendedFile;
            }

            try {
                // Create a safe preview URL
                const previewUrl = URL.createObjectURL(file);

                return Object.assign(file, {
                    preview: previewUrl,
                    // preview: file,
                    id: `${file.name}-${Date.now()}`,
                    typeImage: 'LOGO'
                }) as ExtendedFile;
            } catch (error) {
                console.error("Error creating preview URL:", error);
                return Object.assign(file, {
                    preview: null,
                    id: `${file.name}-${Date.now()}`,
                    typeImage: 'LOGO'
                }) as ExtendedFile;
            }
        });

        setFiles(prev => [...prev, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxSize: 5242880, // 5MB
    });

    // Remove file handler
    const removeFile = (id: string) => {
        setFiles(files.filter(file => file.id !== id));
    };

    // region Handle uploads
    React.useEffect(() => {
        // Clean up previews when component unmounts
        // return () => {
        //     files.forEach(file => {
        //         if (file.preview && typeof file.preview === 'string') {
        //             try {
        //                 URL.revokeObjectURL(file.preview);
        //             } catch (error) {
        //                 console.error("Error revoking URL:", error);
        //             }
        //         }
        //     });
        // };
    }, [files]);
    // endregion

    return (
        <div className="space-y-6">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}>
                <input {...getInputProps()} />
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                    {isDragActive
                        ? "Drop the images here..."
                        : "Drag & drop images here, or click to select files"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    Supports: JPG, PNG, GIF, WEBP (Max 5MB per file)
                </p>
            </div>

            {fileRejections.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm font-medium text-red-800 mb-1">The following files couldn't be accepted:</p>
                    <ul className="text-xs text-red-700 list-disc list-inside">
                        {fileRejections.map(({ file, errors }) => (
                            <li key={file.name}>
                                {file.name} - {errors.map(e => e.message).join(', ')}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {files.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">
                            {files.length} {files.length === 1 ? 'file' : 'files'} for Quote Item #{currentItemIndex + 1}
                        </p>
                    </div>

                    <ul className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                        {files.map((file, index) => (
                            <li key={file.id}
                                className="relative flex flex-col gap-y-4 p-2 border rounded-md bg-white shadow-sm items-center">
                                <div className="relative h-[150px] w-[150px] flex-shrink-0 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                                    {file.preview ? (
                                        <Image
                                            src={file.preview}
                                            alt={file.name}
                                            className="object-contain"
                                            fill
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.style.display = "none";
                                                const parent = target.parentNode as HTMLElement;
                                                parent.classList.add("flex", "items-center", "justify-center");
                                                const fallback = document.createElement("div");
                                                fallback.className = "text-xs text-gray-500 text-center";
                                                fallback.innerText = "No preview";
                                                parent.appendChild(fallback);
                                            }}
                                        />
                                    ) : (
                                        <File className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-900 text-wrap">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>

                                <ImageGallerySelect
                                    file={file}
                                    onChange={(file) =>
                                        setFiles(prevState => prevState.map((innerFile, innerIndex) => {
                                            if (innerIndex === index) return file;
                                            return innerFile;
                                        }) )
                                    }
                                />

                                <Button type="button" variant="ghost" size="sm" className="p-1 text-gray-500 hover:text-red-500 absolute top-0 right-0"
                                        onClick={() => removeFile(file.id)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
                <DialogClose asChild>
                    <Button variant="outline" onClick={() => setFiles([])}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button
                    className="bg-blue-500 text-white"
                    type="submit"
                    disabled={files.length === 0}
                    onClick={() => onSaveImages(files, currentItemIndex)}
                >
                    {files.length > 0 ?`Save ${files.length} Images` : 'Save Images'}
                </Button>
            </div>
        </div>
    );
}
