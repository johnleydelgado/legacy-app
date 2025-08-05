"use client";

import React, { useCallback, useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDropzone } from "react-dropzone";
import {
  Download,
  Trash2,
  Upload,
  FileText,
  AlertCircle,
  Search,
  Filter,
  Archive,
  X,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCustomerFilesByCustomerId,
  useCreateCustomerFile,
  useDeleteCustomerFile,
  useSoftDeleteCustomerFile,
  useSearchCustomerFiles,
  useCustomerFilesWithFilters,
} from "@/hooks/useCustomerFiles";
import { CustomerFile } from "@/services/customer-files/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeleteConfirmationDialog } from "@/components/sheets/delete-confirmation-sheet";

interface FilesTableWithSearchProps {
  customerId: number;
}

interface SelectedFile {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

// Constants
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes

// Custom hook for debouncing values
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function FilesTableWithSearch({
  customerId,
}: FilesTableWithSearchProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [overallProgress, setOverallProgress] = useState(0);

  // Delete confirmation modal states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<CustomerFile | null>(null);

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounceValue(searchQuery, 300);

  /**
   * Map category to mime type pattern for API filtering
   */
  const getCategoryMimeType = (category: string) => {
    switch (category) {
      case "Images":
        return "image/";
      case "PDFs":
        return "application/pdf";
      case "Documents":
        return "application/vnd";
      case "Spreadsheets":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml";
      case "Archives":
        return "application/zip";
      case "Other":
        return "other";
      default:
        return undefined;
    }
  };

  // Use customer files hooks with filters
  const {
    data: customerFilesData,
    isLoading,
    error,
    refetch,
  } = useCustomerFilesWithFilters({
    customerId,
    search: debouncedSearchQuery || undefined,
    mimeType:
      selectedCategory === "all"
        ? undefined
        : getCategoryMimeType(selectedCategory),
    showArchived,
    page: currentPage,
    limit: pageSize,
  });

  const createCustomerFile = useCreateCustomerFile();
  const deleteCustomerFile = useDeleteCustomerFile();
  const softDeleteCustomerFile = useSoftDeleteCustomerFile();

  const files = customerFilesData?.items || [];
  const totalPages = Math.ceil(
    (customerFilesData?.meta?.totalItems || 0) / pageSize
  );

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedCategory, showArchived]);

  /**
   * Handle archived toggle change
   */
  const handleArchivedToggle = (checked: boolean | "indeterminate") => {
    setShowArchived(checked === true);
  };

  /**
   * Handle delete button click - shows confirmation modal
   */
  const handleDeleteClick = (file: CustomerFile) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Handle archive button click - shows confirmation modal
   */
  const handleArchiveClick = (file: CustomerFile) => {
    setFileToDelete(file);
    setIsArchiveDialogOpen(true);
  };

  /**
   * Confirm and execute hard delete
   */
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      await deleteCustomerFile.mutateAsync(fileToDelete.pk_customer_file_id);
      toast.success("File deleted successfully");
    } catch (err) {
      console.error("Failed to delete file", err);
      toast.error("Failed to delete file");
    } finally {
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  /**
   * Confirm and execute soft delete (archive)
   */
  const handleConfirmArchive = async () => {
    if (!fileToDelete) return;

    try {
      await softDeleteCustomerFile.mutateAsync(
        fileToDelete.pk_customer_file_id
      );
      toast.success("File archived successfully");
    } catch (err) {
      console.error("Failed to archive file", err);
      toast.error("Failed to archive file");
    } finally {
      setIsArchiveDialogOpen(false);
      setFileToDelete(null);
    }
  };

  /**
   * Cancel deletion and close modal
   */
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  /**
   * Cancel archiving and close modal
   */
  const handleCancelArchive = () => {
    setIsArchiveDialogOpen(false);
    setFileToDelete(null);
  };

  /**
   * Handle file selection (no auto-upload)
   */
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles: File[] = [];
    const rejectedFiles: { file: File; reason: string }[] = [];

    acceptedFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        rejectedFiles.push({
          file,
          reason: `File size exceeds 15MB limit (${formatFileSize(file.size)})`,
        });
      } else {
        validFiles.push(file);
      }
    });

    // Show errors for rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, reason }) => {
        toast.error(`"${file.name}" rejected: ${reason}`);
      });
    }

    // Add valid files to selection
    if (validFiles.length > 0) {
      const newFiles: SelectedFile[] = validFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: "pending",
      }));

      setSelectedFiles((prev) => [...prev, ...newFiles]);

      if (validFiles.length > 0) {
        toast.success(
          `${validFiles.length} file${
            validFiles.length !== 1 ? "s" : ""
          } selected for upload`
        );
      }
    }
  }, []);

  /**
   * Remove a selected file before upload
   */
  const removeSelectedFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  /**
   * Clear all selected files
   */
  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  /**
   * Upload all selected files
   */
  const uploadAllFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setOverallProgress(0);

    let completedFiles = 0;
    const totalFiles = selectedFiles.length;

    // Process files one by one to avoid overwhelming the server
    for (let i = 0; i < selectedFiles.length; i++) {
      const selectedFile = selectedFiles[i];

      try {
        // Update file status to uploading
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.id === selectedFile.id
              ? { ...f, status: "uploading", progress: 0 }
              : f
          )
        );

        // 1. Ask backend for a signed upload URL
        const res = await fetch(
          `/api/customer-files?customerId=${customerId}&filename=${encodeURIComponent(
            selectedFile.file.name
          )}&filetype=${encodeURIComponent(selectedFile.file.type)}`
        );

        if (!res.ok) {
          throw new Error("Failed to get signed URL");
        }

        const { url, publicUrl, key } = (await res.json()) as {
          url: string;
          publicUrl: string;
          key: string;
        };

        // Update progress to 25% after getting signed URL
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.id === selectedFile.id ? { ...f, progress: 25 } : f
          )
        );

        // 2. Upload directly to S3
        const putRes = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": selectedFile.file.type,
          },
          body: selectedFile.file,
        });

        if (!putRes.ok) {
          throw new Error("Upload failed");
        }

        // Update progress to 75% after S3 upload
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.id === selectedFile.id ? { ...f, progress: 75 } : f
          )
        );

        // 3. Save to database using customer files service
        await createCustomerFile.mutateAsync({
          customerID: customerId,
          fileName: selectedFile.file.name,
          publicUrl: publicUrl,
          mimeType: selectedFile.file.type,
          metadata: {
            size: selectedFile.file.size,
            key: key,
            originalName: selectedFile.file.name,
            uploadedBy: "user", // You might want to get this from auth context
          },
        });

        // Mark as completed
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.id === selectedFile.id
              ? { ...f, status: "completed", progress: 100 }
              : f
          )
        );

        completedFiles++;
        setOverallProgress((completedFiles / totalFiles) * 100);

        toast.success(`File "${selectedFile.file.name}" uploaded successfully`);
      } catch (err) {
        console.error(`Failed to upload file ${selectedFile.file.name}:`, err);

        // Mark as error
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.id === selectedFile.id
              ? {
                  ...f,
                  status: "error",
                  error: err instanceof Error ? err.message : "Upload failed",
                }
              : f
          )
        );

        toast.error(`Failed to upload "${selectedFile.file.name}"`);
      }
    }

    setIsUploading(false);

    // Clear completed files after a delay
    setTimeout(() => {
      setSelectedFiles((prev) => prev.filter((f) => f.status !== "completed"));
    }, 2000);
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFileDialog,
  } = useDropzone({
    onDrop,
    noClick: true, // Prevent click to open, we'll handle it manually
    multiple: true,
    maxSize: MAX_FILE_SIZE,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/zip": [".zip"],
      "application/x-rar-compressed": [".rar"],
      "text/*": [".txt", ".csv"],
    },
  });

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  /**
   * Format the maximum file size for display
   */
  const formatMaxFileSize = () => {
    return formatFileSize(MAX_FILE_SIZE);
  };

  /**
   * Get file category based on MIME type
   */
  const getFileCategory = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "Images";
    if (mimeType.includes("pdf")) return "PDFs";
    if (mimeType.includes("document") || mimeType.includes("doc"))
      return "Documents";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
      return "Spreadsheets";
    if (mimeType.includes("zip") || mimeType.includes("rar"))
      return "ZIP Files";
    return "Other";
  };

  /**
   * Get file icon based on MIME type
   */
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("document") || mimeType.includes("doc")) return "📝";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
      return "📊";
    if (mimeType.includes("zip") || mimeType.includes("rar")) return "🗜️";
    return "📁";
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load customer files. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center p-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">
            {showArchived ? "Archived Files" : "Files"}
          </h3>
          {customerFilesData?.meta && (
            <Badge variant="secondary">
              {customerFilesData.meta.totalItems}{" "}
              {showArchived ? "archived " : ""}files
            </Badge>
          )}
        </div>

        {/* Upload button + dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 cursor-pointer">
              <Upload className="h-4 w-4" /> Upload Files
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
              <DialogDescription>
                Select multiple files to upload to this customer's account.
                <br />
                <span className="text-sm text-muted-foreground">
                  Maximum file size: {formatMaxFileSize()} • Supported formats:
                  Images, PDFs, Documents, Spreadsheets, Archives
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* File Drop Zone */}
              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-8 text-muted-foreground cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <FileText className="h-12 w-12 mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-lg">Drop the files here...</p>
                ) : (
                  <div className="text-center">
                    <p className="text-lg mb-2">Drag & drop files here</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click the button below to browse
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openFileDialog}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Browse Files
                    </Button>
                  </div>
                )}
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      Selected Files ({selectedFiles.length})
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFiles}
                      disabled={isUploading}
                    >
                      Clear All
                    </Button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {selectedFiles.map((selectedFile) => (
                      <div
                        key={selectedFile.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-lg">
                            {getFileIcon(selectedFile.file.type)}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-sm truncate">
                              {selectedFile.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(selectedFile.file.size)} •{" "}
                              {getFileCategory(selectedFile.file.type)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {selectedFile.status === "uploading" && (
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <Progress
                                value={selectedFile.progress}
                                className="h-2"
                              />
                              <span className="text-xs text-muted-foreground">
                                {selectedFile.progress}%
                              </span>
                            </div>
                          )}

                          {selectedFile.status === "completed" && (
                            <Badge variant="default" className="text-xs">
                              ✓ Uploaded
                            </Badge>
                          )}

                          {selectedFile.status === "error" && (
                            <Badge variant="destructive" className="text-xs">
                              ✗ Error
                            </Badge>
                          )}

                          {selectedFile.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeSelectedFile(selectedFile.id)
                              }
                              disabled={isUploading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Overall Progress
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(overallProgress)}%
                    </span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={uploadAllFiles}
                disabled={selectedFiles.length === 0 || isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload {selectedFiles.length} File
                    {selectedFiles.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 p-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Images">Images</SelectItem>
            <SelectItem value="PDFs">PDFs</SelectItem>
            <SelectItem value="Documents">Documents</SelectItem>
            <SelectItem value="Spreadsheets">Spreadsheets</SelectItem>
            <SelectItem value="Archives">ZIP Files</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-archived"
            checked={showArchived}
            onCheckedChange={handleArchivedToggle}
          />
          <label
            htmlFor="show-archived"
            className="text-sm font-medium cursor-pointer"
          >
            Show Archived Files
          </label>
        </div>
      </div>

      {/* Files table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="text-muted-foreground">Loading files...</div>
                </TableCell>
              </TableRow>
            ) : files.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {showArchived
                      ? "No archived files found."
                      : searchQuery || selectedCategory !== "all"
                      ? "No files found matching your criteria."
                      : "No files uploaded yet."}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              files.map((file) => (
                <TableRow key={file.pk_customer_file_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getFileIcon(file.mime_type)}
                      </span>
                      <span className="font-medium">
                        {file.file_name}
                        {file.deleted_at && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Archived
                          </Badge>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {getFileCategory(file.mime_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(file.uploaded_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Button size="icon" variant="outline" asChild>
                      <a
                        href={file.public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </a>
                    </Button>

                    {!file.deleted_at ? (
                      // Actions for active files
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleArchiveClick(file)}
                          disabled={softDeleteCustomerFile.isPending}
                          title="Archive file"
                        >
                          <Archive className="h-4 w-4" />
                          <span className="sr-only">Archive</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDeleteClick(file)}
                          disabled={deleteCustomerFile.isPending}
                          title="Delete file permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </>
                    ) : (
                      // Actions for archived files
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDeleteClick(file)}
                        disabled={deleteCustomerFile.isPending}
                        title="Delete file permanently"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete Permanently</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete File Permanently"
        description={`Are you sure you want to permanently delete the file "${fileToDelete?.file_name}"? This action cannot be undone and will remove the file from both storage and database.`}
        onDelete={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Archive Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isArchiveDialogOpen}
        onOpenChange={setIsArchiveDialogOpen}
        title="Archive File"
        description={`Are you sure you want to archive the file "${fileToDelete?.file_name}"? You can restore it later from the archive.`}
        onDelete={handleConfirmArchive}
        onCancel={handleCancelArchive}
      />
    </div>
  );
}
