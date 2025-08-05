"use client";

import * as React from "react";
import { Search, Loader2, Factory, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFactories } from "@/hooks/useFactories";

// Factory interface based on backend entity
interface SelectedFactory {
  id: string;
  name: string;
  email: string;
  industry: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface FactorySelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFactory: (id: number) => void;
}

export function FactorySelectDialog({
  open,
  onOpenChange,
  onSelectFactory,
}: FactorySelectDialogProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Use the factories hook
  const {
    data: factoriesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useFactories();

  const factories = factoriesResponse?.items || [];

  // Filter factories based on search term
  const filteredFactories = React.useMemo(() => {
    if (!Array.isArray(factories)) return [];
    if (!searchTerm.trim()) return factories;
    const search = searchTerm.toLowerCase();
    return factories.filter((factory) => {
      return (
        factory.name.toLowerCase().includes(search) ||
        (factory.email && factory.email.toLowerCase().includes(search)) ||
        (factory.industry && factory.industry.toLowerCase().includes(search))
      );
    });
  }, [factories, searchTerm]);

  // Reset search when dialog opens
  React.useEffect(() => {
    if (open) {
      setSearchTerm("");
    }
  }, [open]);

  const handleSelectFactory = (factory: any) => {
    onSelectFactory(factory.pk_factories_id);
    onOpenChange(false);
  };

  if (isError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Factory</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Error loading factories: {error?.message}</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-purple-600" />
            Select Factory
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search factories by name, email, or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Factory List */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading factories...</span>
            </div>
          ) : filteredFactories.length === 0 ? (
            <div className="text-center py-8">
              <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? "No factories found matching your search." : "No factories available."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFactories.map((factory) => (
                <div
                  key={factory.pk_factories_id}
                  className="border rounded-lg p-4 hover:bg-purple-50 hover:border-purple-200 cursor-pointer transition-colors"
                  onClick={() => handleSelectFactory(factory)}
                >
                  <div className="flex items-start gap-3">
                    {/* Factory Icon */}
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Factory className="h-5 w-5 text-purple-600" />
                    </div>

                    {/* Factory Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {factory.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          factory.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {factory.status}
                        </span>
                      </div>

                      {/* Industry */}
                      {factory.industry && (
                        <div className="flex items-center gap-1 mb-1">
                          <Building className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{factory.industry}</span>
                        </div>
                      )}

                      {/* Email */}
                      {factory.email && (
                        <p className="text-xs text-gray-500 truncate">
                          {factory.email}
                        </p>
                      )}

                      {/* Website */}
                      {factory.website_url && (
                        <p className="text-xs text-purple-600 truncate">
                          {factory.website_url}
                        </p>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-gray-500">
            {filteredFactories.length} factories found
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}