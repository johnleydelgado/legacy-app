"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Plus, Pencil, Trash2, Download, Upload, Save, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  useEmailNotifications,
  useCreateEmailNotification,
  useUpdateEmailNotification,
  useDeleteEmailNotification,
} from "@/hooks/useEmailNotifications";
import type { EmailNotification } from "@/services/email-notifications/types";

/* ─────────────────────────── TYPES ─────────────────────────── */

type EmailStatus = "Active" | "Inactive";

interface NewEmailForm {
  address: string;
  status: EmailStatus;
  description?: string;
}

/* ───────────────────────── Badge ───────────────────────────── */

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

/* ───────────────── EmailNotification ──────────────────────── */

const EmailNotification: React.FC = () => {
  /* ------------------------ hooks ------------------------ */
  const {
    data: emailsData,
    isLoading,
    error,
    refetch,
  } = useEmailNotifications();
  const { createEmailNotification, isLoading: isCreating } =
    useCreateEmailNotification();
  const { updateEmailNotification, isLoading: isUpdating } =
    useUpdateEmailNotification();
  const { deleteEmailNotification, isLoading: isDeleting } =
    useDeleteEmailNotification();

  const [editingEmailId, setEditingEmailId] = useState<number | null>(null);

  /* ------------------------ form ------------------------- */
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<NewEmailForm>({
    defaultValues: {
      address: "",
      status: "Active",
      description: "",
    },
  });

  const onSubmit = async (data: NewEmailForm) => {
    try {
      if (editingEmailId) {
        // Update existing email
        const result = await updateEmailNotification(editingEmailId, {
          email_address: data.address.trim(),
          status: data.status,
          description: data.description?.trim(),
        });

        if (result) {
          toast.success("Email notification updated successfully");
          setEditingEmailId(null);
          reset();
          refetch();
        } else {
          toast.error("Failed to update email notification");
        }
      } else {
        // Add new email
        const result = await createEmailNotification({
          email_address: data.address.trim(),
          status: data.status,
          description: data.description?.trim(),
        });

        if (result) {
          toast.success("Email notification created successfully");
          reset();
          refetch();
        } else {
          toast.error("Failed to create email notification");
        }
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    }
  };

  const handleEdit = (email: EmailNotification) => {
    setEditingEmailId(email.pk_email_notification_id);
    setValue("address", email.email_address);
    setValue("status", email.status);
    setValue("description", email.description || "");
  };

  const handleCancelEdit = () => {
    setEditingEmailId(null);
    reset();
  };

  /* --------------------- actions ------------------------- */
  const handleDelete = async (id: number) => {
    try {
      const success = await deleteEmailNotification(id);
      if (success) {
        toast.success("Email notification deleted successfully");
        refetch();
      } else {
        toast.error("Failed to delete email notification");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    }
  };

  const handleExport = () => {
    if (!emailsData?.items) {
      toast.error("No data to export");
      return;
    }

    const blob = new Blob([JSON.stringify(emailsData.items, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-notifications-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Email notifications exported successfully");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      try {
        const imported: EmailNotification[] = JSON.parse(text);
        // Note: You might want to implement bulk import functionality
        toast.info("Import functionality will be implemented soon");
      } catch {
        toast.error("Invalid file format");
      }
    });
  };

  /* ------------------------ UI --------------------------- */
  return (
    <div className="space-y-8 pb-32">
      {/* Page header */}
      <h1 className="text-xl font-semibold">Email Notification Settings</h1>
      <p className="text-muted-foreground">
        Manage email addresses for quote approval notifications and alerts.
      </p>

      {/* Add/Edit email form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingEmailId ? "Edit Email Address" : "Add New Email Address"}
          </CardTitle>
          <CardDescription>
            {editingEmailId
              ? "Update email address details below."
              : "Add email addresses for system notifications and alerts."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {/* Email address */}
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-medium">
                Email Address
              </label>
              <Input
                placeholder="admin@company.com"
                {...register("address", {
                  required: "Email is required",
                  pattern: {
                    value:
                      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                    message: "Invalid email address",
                  },
                })}
                aria-invalid={errors.address ? "true" : "false"}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-medium">Status</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Brief description of this email's purpose"
                className={cn(
                  "border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                )}
                {...register("description")}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              size="sm"
              type="submit"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {editingEmailId ? "Updating..." : "Creating..."}
                </>
              ) : editingEmailId ? (
                <>
                  <Save className="size-4" /> Update Email
                </>
              ) : (
                <>
                  <Plus className="size-4" /> Add Email
                </>
              )}
            </Button>
            {editingEmailId && (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleCancelEdit}
                disabled={isCreating || isUpdating}
              >
                Cancel Edit
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>

      {/* Current email addresses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Email Addresses</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="size-4" /> Export List
              </Button>

              <div>
                <input
                  id="email-import"
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleImport}
                />
                <label htmlFor="email-import">
                  <Button asChild variant="outline" size="sm">
                    <span className="flex items-center gap-2">
                      <Upload className="size-4" /> Import Emails
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="divide-y">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading email notifications...
            </div>
          ) : error ? (
            <div className="py-8 text-center text-destructive">
              Error loading email notifications: {error.message}
            </div>
          ) : emailsData?.items && emailsData.items.length > 0 ? (
            emailsData.items.map((email) => (
              <div
                key={email.pk_email_notification_id}
                className="flex items-start justify-between p-4 border-y border-gray-200"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-4">
                    <p className="font-medium leading-none">
                      {email.email_address}
                    </p>
                    <Badge
                      className={
                        email.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {email.status}
                    </Badge>
                  </div>
                  {email.description && (
                    <p className="text-sm text-muted-foreground">
                      Description: {email.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Added on {format(new Date(email.created_at), "MMM d, yyyy")}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(email)}
                    title="Edit"
                    disabled={isUpdating || isDeleting}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(email.pk_email_notification_id)}
                    title="Delete"
                    disabled={isUpdating || isDeleting}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No email notifications found. Add your first email notification
              above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailNotification;
