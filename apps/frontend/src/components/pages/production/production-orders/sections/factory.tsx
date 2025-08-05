"use client";

import * as React from "react";
import {
  Edit,
  SquarePen,
  Factory as FactoryIcon,
  Loader2,
  FileText,
  Globe,
  StickyNote,
  Mail,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FactorySelectDialog } from "@/components/dialogs/factory-select-dialog";

// Factory type interface (based on backend entity)
interface FactoryTypes {
  pk_factories_id: number;
  name: string;
  email?: string;
  website_url?: string;
  industry?: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE';
  user_owner: string;
}

interface FactoryComponentProps {
  factoryData: FactoryTypes | null;
  factoryID: number;
  setFactoryID: React.Dispatch<React.SetStateAction<number>>;
  setModifyFlag: React.Dispatch<React.SetStateAction<boolean>>;
  factoryLoading?: boolean;
  setFactoryChange?: (tick: boolean) => void;
}

const Factory = ({
  factoryData,
  factoryID,
  setFactoryID,
  setModifyFlag,
  factoryLoading,
  setFactoryChange,
}: FactoryComponentProps) => {
  const [selectFactory, setSelectFactory] = React.useState<boolean>(false);

  // Handle factory selection
  const handleFactorySelect = (factoryId: number) => {
    setFactoryID(factoryId);
    setModifyFlag(true);
    if (setFactoryChange) setFactoryChange(true);
    setSelectFactory(false);
  };

  // Derived display helpers
  const factoryName = factoryData?.name || "";
  const factoryEmail = factoryData?.email || "";
  const factoryWebsite = factoryData?.website_url || "";
  const factoryIndustry = factoryData?.industry || "";
  const factoryNotes = factoryData?.notes || "";
  const factoryStatus = factoryData?.status || "ACTIVE";

  if (factoryLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Factory Information</h3>
            <p className="text-sm text-muted-foreground">Loading factory details...</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Factory Information Card - Top Wide Card */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
        {/* header: icon + label */}
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-100 rounded-full p-2">
            <FactoryIcon className="h-4 w-4 text-purple-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">
            Factory Information
          </h2>
        </div>

        {/* body */}
        {factoryLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto mb-2" />
              <span className="text-sm text-gray-500">
                Loading factory information...
              </span>
            </div>
          </div>
        ) : factoryData ? (
          <div className="flex gap-4">
            {/* Factory Avatar/Logo */}
            <div className="relative h-12 w-12 rounded-md overflow-hidden shrink-0 bg-purple-100 flex items-center justify-center">
              <FactoryIcon className="h-6 w-6 text-purple-600" />
            </div>

            {/* Factory details */}
            <div className="flex-1 space-y-3 text-sm text-gray-700">
              {/* Factory name and basic info */}
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {factoryName || "Unknown Factory"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-xs px-2 py-1 rounded-full ${
                    factoryStatus === 'ACTIVE' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {factoryStatus}
                  </p>
                  {factoryIndustry && (
                    <p className="text-gray-500 text-xs">{factoryIndustry}</p>
                  )}
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-2">
                {/* Email */}
                {factoryEmail && (
                  <div className="flex items-start gap-2">
                    <Mail size={14} className="mt-px text-gray-400" />
                    <span>{factoryEmail}</span>
                  </div>
                )}

                {/* Website */}
                {factoryWebsite && (
                  <div className="flex items-start gap-2">
                    <Globe size={14} className="mt-px text-gray-400" />
                    <span className="text-purple-600 hover:underline cursor-pointer">
                      {factoryWebsite}
                    </span>
                  </div>
                )}
              </div>

              {/* Factory Notes */}
              {factoryNotes && (
                <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                  <p className="text-xs font-medium text-purple-900 mb-1">Notes:</p>
                  <p className="text-sm text-purple-800">{factoryNotes}</p>
                </div>
              )}

              {/* Change Factory Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer text-xs"
                  onClick={() => setSelectFactory(true)}
                  disabled={factoryLoading}
                  size="sm"
                >
                  <Edit className="h-3 w-3" />
                  Change Factory
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-gray-50 rounded-full p-3 mx-auto w-fit mb-2">
              <FactoryIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              No factory selected
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Select a factory to handle production for this order
            </p>
            <Button
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer text-xs"
              onClick={() => setSelectFactory(true)}
              disabled={factoryLoading}
              size="sm"
            >
              <Edit className="h-3 w-3" />
              Select Factory
            </Button>
          </div>
        )}
      </div>


      {/* Factory Selection Dialog */}
      <FactorySelectDialog
        open={selectFactory}
        onOpenChange={setSelectFactory}
        onSelectFactory={handleFactorySelect}
      />
    </div>
  );
};

export default Factory;