"use client";

import * as React from "react";
import { X, Mail, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface EmailSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendEmails: (emails: string[]) => void;
  customerEmail?: string;
  customerName?: string;
  quoteNumber?: string;
  isLoading?: boolean;
}

export function EmailSelectionDialog({
  open,
  onOpenChange,
  onSendEmails,
  customerEmail,
  customerName,
  quoteNumber,
  isLoading = false,
}: EmailSelectionDialogProps) {
  const [emails, setEmails] = React.useState<string[]>([]);
  const [newEmail, setNewEmail] = React.useState("");

  // Initialize with customer email when dialog opens
  React.useEffect(() => {
    if (open && customerEmail) {
      // Reset and initialize with customer email when dialog opens
      setEmails([customerEmail]);
    }
  }, [open, customerEmail]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;

    if (!isValidEmail(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (emails.includes(newEmail)) {
      toast.error("Email already added");
      return;
    }

    setEmails([...emails, newEmail]);
    setNewEmail("");
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSend = () => {
    if (emails.length === 0) {
      toast.error("Please add at least one email address");
      return;
    }

    onSendEmails(emails);
  };

  const handleClose = () => {
    setEmails([]);
    setNewEmail("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Quote for Approval
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="quote-info" className="text-sm font-medium">
              Quote Information
            </Label>
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Quote:</strong> {quoteNumber}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Customer:</strong> {customerName}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="email-recipients" className="text-sm font-medium">
              Email Recipients
            </Label>
            <div className="mt-2 space-y-2">
              {/* Selected Emails */}
              {emails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {emails.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      <span className="text-xs">{email}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveEmail(email);
                        }}
                        className="ml-1 hover:text-red-500 focus:outline-none"
                        aria-label={`Remove ${email}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add New Email */}
              <div className="flex gap-2">
                <Input
                  id="new-email"
                  placeholder="Enter email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddEmail}
                  disabled={!newEmail.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> The quote approval link will be sent to all
              selected email addresses. Recipients can view and approve the
              quote using the unique link.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={emails.length === 0 || isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send for Approval
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
