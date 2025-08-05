'use client';

import React, { useState, useEffect } from 'react';
import Dropzone from 'react-dropzone';
import { Image, X } from "lucide-react";

interface ComponentProps {
    logoFile: File | string | null;
    setLogoFile: (file: File | null) => void;
    notModify?: boolean;
    disabledUpload?: boolean;
    width?: string;
    height?: string;
}

const LogoCell2: React.FC<ComponentProps> = (
    {
        logoFile,
        setLogoFile,
        notModify = false,
        disabledUpload = false,
        width =  '110px' ,
        height = '100px',
    }) => {
    const [preview, setPreview] = useState<string | null>(null);

    // Generate preview URL when file changes
    useEffect(() => {
        if (!logoFile) {
            setPreview(null);
            return;
        }

        let objectUrl = null

        if (typeof logoFile === 'string') {
            setPreview(logoFile);
        } else {
            objectUrl = URL.createObjectURL(logoFile);
            setPreview(objectUrl);
        }

        if (objectUrl) {
            // Free memory when this component unmounts
            return () => URL.revokeObjectURL(objectUrl);
        }

    }, [logoFile]);

    const handleDrop = (acceptedFiles: File[]) => {
        if (notModify) return;

        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setLogoFile(file);
            // console.log(file);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        if (notModify) return;

        e.stopPropagation(); // Prevent dropzone from opening
        setLogoFile(null);
    };

    return (
        <Dropzone
            onDrop={handleDrop}
            multiple={false}
            accept={{
                'image/*': []
            }}
            disabled={notModify}
        >
            {({getRootProps, getInputProps}) => (
                <div
                    className={`flex items-center justify-center border border-dashed rounded-lg overflow-hidden relative ${notModify ? '' : 'cursor-pointer'}`}
                    style={{ height, width }}
                >
                    <div
                        {...getRootProps({
                            className: 'dropzone',
                            onDrop: event => event.stopPropagation()
                        })}
                    >
                        <input {...getInputProps()} disabled={notModify} />
                        <div className="flex flex-col items-center justify-center">
                            {preview ? (
                                <>
                                    <img
                                        src={preview}
                                        alt="Logo preview"
                                        className="max-h-[90px] max-w-[90px] object-contain rounded-lg"
                                    />
                                    {!notModify && (
                                        <button
                                            className="absolute top-0 right-0 bg-red-500 bg-opacity-70 rounded-full p-0.5 m-1 text-white hover:bg-opacity-90 focus:outline-none cursor-pointer"
                                            onClick={handleClear}
                                            aria-label="Remove logo"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Image size={16} className={notModify ? "opacity-50" : ""} />
                                    <p className={`text-xs mt-1 ${notModify ? "opacity-50" : ""}`}>
                                        {notModify ? "Click edit to upload" : "Add Logo"}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Dropzone>
    );
}

export default LogoCell2;
