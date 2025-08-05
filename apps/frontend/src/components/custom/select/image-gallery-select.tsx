'use client';

import * as React from 'react';
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "../../ui/select";
import {ExtendedFile} from "../../pages/crm/quotes-details/sections/image-upload-dropzone";

interface ComponentProps {
    file: ExtendedFile;
    onChange: (file: ExtendedFile) => void;
    className?: string;
}


export const switchColor = (type: string) => {
    switch (type) {
        case "LOGO":
            return 'bg-blue-500';

        case "ARTWORK":
            return 'bg-red-500';

        default:
            return 'bg-orange-300';
    }
}

const ImageGallerySelect = ({ file, onChange, className }: ComponentProps) => {
    return (
        <Select value={file.typeImage}
                onValueChange={(e) => onChange(
                    Object.assign(file, {
                        typeImage: e
                    }) as ExtendedFile
                )}
        >
            <SelectTrigger className={`w-[180px] text-white text-xs ${switchColor(file.typeImage)} ${className}`}>
                <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="LOGO" className="text-xs bg-blue-500 text-white rounded-none hover:bg-blue-200 hover:text-white">Logo</SelectItem>
                    <SelectItem value="ARTWORK" className="text-xs bg-red-500 text-white rounded-none hover:bg-red-200 hover:text-white">Artwork</SelectItem>
                    <SelectItem value="OTHER" className="text-xs bg-orange-500 text-white rounded-none hover:bg-orange-200 hover:text-white">Other</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default ImageGallerySelect;
