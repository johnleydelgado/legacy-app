// components/forms/customer/address-card.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AddressBlock } from "./address-block";

interface Props {
  idx: number;
  prefix: `addresses.${number}`;
  onRemove: () => void;
}

export function AddressCardItem({ idx, prefix, onRemove }: Props) {
  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            Shipping Address&nbsp;#{idx}
          </CardTitle>
          {idx > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="p-1 rounded-l-full bg-red-400"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <AddressBlock prefix={prefix} />
      </CardContent>
    </Card>
  );
}
