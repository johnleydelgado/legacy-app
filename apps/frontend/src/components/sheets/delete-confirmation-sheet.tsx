// components/DeleteConfirmationDialog.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
    DialogOverlay,
    DialogFooter,
} from "@/components/ui/dialog";
import { XIcon } from "lucide-react";

interface DeleteConfirmationDialogProps {
    /** Controls whether the dialog is open */
    open: boolean;
    /** Called when the dialog’s open state changes (e.g. when closed) */
    onOpenChange: (open: boolean) => void;
    /** Title text to display, e.g. “Confirm Deletion” */
    title: string;
    /** Description text, e.g. “Are you sure you want to delete this item?” */
    description: string;
    /** Called when the user confirms deletion */
    onDelete: () => void;
    /** Called when the user cancels */
    onCancel: () => void;
}

export function DeleteConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    onDelete,
    onCancel,
}: DeleteConfirmationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Overlay: semi‐transparent full‐screen */}
            <DialogOverlay />

            {/* Content: centered in viewport */}
            <DialogContent className="max-w-lg max-h-full">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>{title}</DialogTitle>

                    </div>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onCancel();
                            onOpenChange(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onDelete();
                            onOpenChange(false);
                        }}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
