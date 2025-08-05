"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Ruler,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import {
  useShippingDimensionPresets,
  useCreateShippingDimensionPreset,
  useUpdateShippingDimensionPreset,
  useDeleteShippingDimensionPreset,
} from "@/hooks/useShippingDimensionPresets";
import type {
  ShippingDimensionPreset,
  CreateShippingDimensionPresetRequest,
  UpdateShippingDimensionPresetRequest,
} from "@/services/shipping-dimension-presets/types";

interface DimensionPresetFormData {
  name: string;
  length: number;
  width: number;
  height: number;
  description: string;
  measurement_unit: "metric" | "imperial";
  is_active: boolean;
}

const DimensionPresetsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [unitFilter, setUnitFilter] = useState<"all" | "metric" | "imperial">(
    "all"
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPreset, setEditingPreset] =
    useState<ShippingDimensionPreset | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Hooks
  const {
    data: presetsData,
    isLoading,
    error,
    refetch,
  } = useShippingDimensionPresets();

  const { createShippingDimensionPreset, isLoading: isCreating } =
    useCreateShippingDimensionPreset();
  const { updateShippingDimensionPreset, isLoading: isUpdating } =
    useUpdateShippingDimensionPreset();
  const { deleteShippingDimensionPreset, isLoading: isDeleting } =
    useDeleteShippingDimensionPreset();

  // Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DimensionPresetFormData>({
    defaultValues: {
      name: "",
      length: 0,
      width: 0,
      height: 0,
      description: "",
      measurement_unit: "imperial",
      is_active: true,
    },
  });

  const watchedUnit = watch("measurement_unit");

  // Filter presets
  const filteredPresets =
    presetsData?.items?.filter((preset) => {
      const matchesSearch =
        preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && preset.is_active) ||
        (statusFilter === "inactive" && !preset.is_active);
      const matchesUnit =
        unitFilter === "all" || preset.measurement_unit === unitFilter;

      return matchesSearch && matchesStatus && matchesUnit;
    }) || [];

  // Form submission
  const onSubmit = async (data: DimensionPresetFormData) => {
    try {
      // Convert string values to numbers for the API
      const apiData = {
        name: data.name,
        length: Number(data.length),
        width: Number(data.width),
        height: Number(data.height),
        description: data.description || undefined,
        measurement_unit: data.measurement_unit,
        is_active: data.is_active,
      };

      if (editingPreset) {
        const result = await updateShippingDimensionPreset(
          editingPreset.pk_dimension_preset_id,
          apiData
        );

        if (result) {
          toast.success("Dimension preset updated successfully");
          setEditingPreset(null);
          reset();
          refetch();
          setIsCreateDialogOpen(false);
        } else {
          toast.error("Failed to update dimension preset");
        }
      } else {
        const result = await createShippingDimensionPreset(apiData);

        if (result) {
          toast.success("Dimension preset created successfully");
          reset();
          refetch();
          setIsCreateDialogOpen(false);
        } else {
          toast.error("Failed to create dimension preset");
        }
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    }
  };

  // Handle edit
  const handleEdit = (preset: ShippingDimensionPreset) => {
    setEditingPreset(preset);
    setValue("name", preset.name);
    setValue("length", preset.length);
    setValue("width", preset.width);
    setValue("height", preset.height);
    setValue("description", preset.description || "");
    setValue("measurement_unit", preset.measurement_unit);
    setValue("is_active", preset.is_active);
    setIsCreateDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      const success = await deleteShippingDimensionPreset(id);
      if (success) {
        toast.success("Dimension preset deleted successfully");
        setDeleteConfirmId(null);
        refetch();
      } else {
        toast.error("Failed to delete dimension preset");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    }
  };

  // Handle export
  const handleExport = () => {
    if (!filteredPresets.length) {
      toast.error("No data to export");
      return;
    }

    const blob = new Blob([JSON.stringify(filteredPresets, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dimension-presets-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Dimension presets exported successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Dimension Presets
          </h2>
          <p className="text-sm text-gray-600">
            Manage standard package dimensions for shipping
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => {
              setEditingPreset(null);
              reset();
              setIsCreateDialogOpen(true);
            }}
            size="sm"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Preset
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search presets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value: any) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={unitFilter}
              onValueChange={(value: any) => setUnitFilter(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                <SelectItem value="imperial">Imperial</SelectItem>
                <SelectItem value="metric">Metric</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Presets Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dimension presets...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Error loading dimension presets: {error.message}
          </div>
        ) : filteredPresets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPresets.map((preset) => (
                <TableRow key={preset.pk_dimension_preset_id}>
                  <TableCell className="font-medium">{preset.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Ruler className="h-4 w-4 text-gray-500" />
                      <span>
                        {preset.length} × {preset.width} × {preset.height}
                        {preset.measurement_unit === "imperial" ? " in" : " cm"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {preset.measurement_unit === "imperial"
                        ? "Imperial"
                        : "Metric"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={preset.is_active ? "default" : "secondary"}
                      className={cn(
                        preset.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {preset.is_active ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={preset.description || ""}>
                      {preset.description || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {format(new Date(preset.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(preset)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setDeleteConfirmId(preset.pk_dimension_preset_id)
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center">
            <Ruler className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No dimension presets found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all" || unitFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "Get started by creating your first dimension preset."}
            </p>
            {!searchTerm && statusFilter === "all" && unitFilter === "all" && (
              <Button
                onClick={() => {
                  setEditingPreset(null);
                  reset();
                  setIsCreateDialogOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Preset
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPreset
                ? "Edit Dimension Preset"
                : "Create New Dimension Preset"}
            </DialogTitle>
            <DialogDescription>
              {editingPreset
                ? "Update the dimension preset details below."
                : "Add a new dimension preset for shipping packages."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Preset Name *</Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                placeholder="e.g., Small Box, Medium Box"
                className="mt-1"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="length">Length *</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  min="0"
                  {...register("length", {
                    required: "Length is required",
                    min: { value: 0, message: "Length must be positive" },
                  })}
                  className="mt-1"
                />
                {errors.length && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.length.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="width">Width *</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  min="0"
                  {...register("width", {
                    required: "Width is required",
                    min: { value: 0, message: "Width must be positive" },
                  })}
                  className="mt-1"
                />
                {errors.width && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.width.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="height">Height *</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  min="0"
                  {...register("height", {
                    required: "Height is required",
                    min: { value: 0, message: "Height must be positive" },
                  })}
                  className="mt-1"
                />
                {errors.height && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.height.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Ruler className="h-4 w-4" />
              <span>
                Units: {watchedUnit === "imperial" ? "inches" : "centimeters"}
              </span>
            </div>

            <div>
              <Label htmlFor="measurement_unit">Measurement Unit</Label>
              <Select
                value={watchedUnit}
                onValueChange={(value: "metric" | "imperial") =>
                  setValue("measurement_unit", value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="imperial">Imperial (inches)</SelectItem>
                  <SelectItem value="metric">Metric (cm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register("description")}
                placeholder="Brief description of this preset's use case"
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={watch("is_active")}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreating || isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating || isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingPreset ? "Updating..." : "Creating..."}
                  </>
                ) : editingPreset ? (
                  "Update Preset"
                ) : (
                  "Create Preset"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Dimension Preset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this dimension preset? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DimensionPresetsList;
