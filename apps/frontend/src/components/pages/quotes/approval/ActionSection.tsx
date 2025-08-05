"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, Loader2 } from "lucide-react";
import { Search } from "lucide-react";
import React from "react";

interface Props {
  acknowledged: boolean;
  setAcknowledged: (v: boolean) => void;
  isApproving: boolean;
  isRejecting: boolean;
  handleApprove: () => void;
  onDecline?: () => void;
}

const ActionSection = ({
  acknowledged,
  setAcknowledged,
  isApproving,
  isRejecting,
  handleApprove,
  onDecline,
}: Props) => {
  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4">
      {/* Acknowledgement Checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="acknowledge"
          checked={acknowledged}
          onCheckedChange={(v) => setAcknowledged(Boolean(v))}
        />
        <label htmlFor="acknowledge" className="text-sm select-none">
          I have reviewed and agree to the order details above.
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button
          className="bg-green-600 hover:bg-green-700 gap-2"
          onClick={handleApprove}
          disabled={!acknowledged || isApproving}
        >
          {isApproving && <Loader2 className="h-4 w-4 animate-spin" />}
          Approve&nbsp;&amp;&nbsp;Sign
        </Button>
        <Button
          variant="destructive"
          onClick={onDecline}
          disabled={isRejecting || isApproving}
          className="gap-2"
        >
          {isRejecting && <Loader2 className="h-4 w-4 animate-spin" />}
          Decline
        </Button>
      </div>

      {/* Floating Zoom (only on small screens) */}
      <button className="fixed bottom-6 right-6 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 md:hidden">
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ActionSection;
