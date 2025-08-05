import { formatCurrency } from "@/utils/currency";
import type { QuoteItem } from "@/services/quote-items/types";

interface QuoteItemsTableProps {
  items: QuoteItem[];
  itemsTotal: number;
  taxRate: number;
  deposit: number;
  total: number;
  showEstimationNote?: boolean;
}

const QuoteItemsTable = ({
  items,
  itemsTotal,
  taxRate,
  deposit,
  total,
  showEstimationNote = false,
}: QuoteItemsTableProps) => {
  return (
    <>
      <div className="border rounded-lg overflow-x-auto text-sm">
        <div className="min-w-[900px]">
          {/* Header */}
          <div className="grid grid-cols-8 bg-muted/50 font-semibold px-4 py-3">
            <div>Name</div>
            <div>SKU</div>
            <div>Body Colour</div>
            <div>Size</div>
            <div className="text-center">Freight Type</div>
            <div className="text-right">Price</div>
            <div className="text-right">Qty</div>
            <div className="text-right">Subtotal</div>
          </div>

          {/* Rows */}
          {items.map((item) => (
            <div
              key={item.pk_quote_item_id}
              className="grid grid-cols-8 px-4 py-4 border-t"
            >
              <div>{item.item_name || item.item_description}</div>
              <div>{item.product_data?.sku || "-"}</div>
              <div>{item.yarn_data?.yarn_color || "-"}</div>
              <div>{item.product_data?.style || "-"}</div>
              <div className="text-center">{"None"}</div>
              <div className="text-right">
                {formatCurrency(Number(item.unit_price) || 0)}
              </div>
              <div className="text-right">{item.quantity || 0}</div>
              <div className="text-right font-medium">
                {formatCurrency(
                  (Number(item.unit_price) || 0) * (item.quantity || 0)
                )}
              </div>
            </div>
          ))}

          {/* Cost breakdown */}
          <div className="grid grid-cols-8 px-4 py-3 border-t">
            <div className="col-span-7 text-right font-semibold">
              Merchandise Total
            </div>
            <div className="text-right font-semibold">
              {formatCurrency(itemsTotal)}
            </div>
          </div>

          <div className="grid grid-cols-8 px-4 py-3 border-t">
            <div className="col-span-7 text-right font-semibold">Tax Rate</div>
            <div className="text-right font-semibold">
              {taxRate.toFixed(2)} %
            </div>
          </div>

          <div className="grid grid-cols-8 px-4 py-3 border-t">
            <div className="col-span-7 text-right font-semibold">
              Initial Deposit (50 %)
            </div>
            <div className="text-right font-semibold">
              {formatCurrency(deposit)}
            </div>
          </div>

          <div className="grid grid-cols-8 px-4 py-4 border-t bg-muted/50 text-base font-bold">
            <div className="col-span-7 text-right">Estimated Total*</div>
            <div className="text-right">{formatCurrency(total)}</div>
          </div>
        </div>
      </div>

      {/* Over/under note */}
      {showEstimationNote && (
        <p className="text-xs italic">
          *Estimated total subject to 5–6 % over/under manufacturing policy.
          Final invoice will reflect actual pairs shipped.
        </p>
      )}
    </>
  );
};

export default QuoteItemsTable;
