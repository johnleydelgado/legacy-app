"use client";

import Link from "next/link";
import { BackHeader } from "@/components/ui/back-header";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";

interface Props {
    /** 
     * If present, use this for the back header 
     * (e.g. “Add New Product” → “/products/add”). 
     */
    add?: { title: string; href: string };

    /** 
     * If present, use this for the back header 
     * and show Edit/Delete buttons on the right. 
     */
    details?: { title: string; href: string };

    /** Called when the user clicks “Edit” */
    onEdit?: () => void;

    /** Called when the user clicks “Delete” */
    onDelete?: () => void;
}

export function HeaderWithActions({ details, add, onEdit, onDelete }: Props) {
    // Choose “add” if provided; otherwise fall back to “[id]”
    const href = add?.href ?? details?.href ?? "";
    const title = add?.title ?? details?.title ?? "";

    return (
        <div className="flex items-center justify-between mb-6">
            {/* Left side: Back link + title */}
            <BackHeader href={href} title={title} />

            {/* Right side: only show when “[id]” is present */}
            {details && (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onEdit}
                        className="flex items-center gap-1"
                    >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit</span>
                    </Button>

                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={onDelete}
                        className="flex items-center gap-1"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
