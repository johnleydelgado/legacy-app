'use client';

import { useState, ChangeEvent, InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";


interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Placeholder text for the input */
    placeholder?: string;
    /** Callback function when input value changes */
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    /** Input value for controlled component */
    value?: string;
    /** Additional CSS classes */
    className?: string;
}


export default function SearchInput(
    {
        placeholder = "Search...",
        onChange,
        value: externalValue,
        className = "",
        ...props
    }: SearchInputProps) {
    const [internalValue, setInternalValue] = useState<string>("");

    // Use either controlled or uncontrolled value
    const value = externalValue !== undefined ? externalValue : internalValue;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInternalValue(e.target.value);
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"/>
            <Input
                className={`pl-10 ${className}`}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                {...props}
            />
        </div>
    );
}
