import { useCallback } from "react";
import { toast } from "sonner";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCreateOrderItem } from "@/hooks/useOrdersItems";
import type { CreateOrderDto } from "@/services/orders/types";
import type { CreateOrderItemDTO } from "@/services/orders-items/types";
import type { QuoteItem } from "@/services/quote-items/types";

interface UseOrderCreationProps {
  customerId?: number;
  quoteId?: number;
  quoteItemsData?: { items: QuoteItem[] };
  itemsTotal: number;
  taxDue: number;
  taxRate: number;
}

export const useOrderCreation = ({
  customerId,
  quoteId,
  quoteItemsData,
  itemsTotal,
  taxDue,
  taxRate,
}: UseOrderCreationProps) => {
  const { mutateAsync: createOrder } = useCreateOrder();
  const { createOrderItem } = useCreateOrderItem();

  const createOrderFromQuote = useCallback(async () => {
    try {
      if (!customerId || !quoteItemsData || !quoteItemsData.items?.length) {
        console.warn("[Order Creation] Missing data – cannot create order");
        return;
      }

      // Basic order metadata
      const todayISO = new Date().toISOString().split("T")[0];

      const orderPayload: CreateOrderDto = {
        customerID: customerId,
        statusID: 4, // Default status – adjust as necessary
        quotesID: quoteId || undefined, // Add quote ID for serial encoder
        orderDate: todayISO,
        deliveryDate: todayISO,
        subtotal: itemsTotal,
        taxTotal: taxDue,
        currency: "USD",
        notes: "",
        terms: "",
        tags: "[]",
        userOwner: "Customer Approval System", // Provide a default user owner
      };

      // Create order first
      const createdOrder = await createOrder(orderPayload);

      // Then create each order item (fire in parallel)
      await Promise.all(
        (quoteItemsData.items || []).map(async (item) => {
          const orderItemPayload: CreateOrderItemDTO = {
            orderID: createdOrder.pk_order_id,
            productID: item.product_data?.pk_product_id ?? -1,
            packagingID: item.packaging_data?.pk_packaging_id ?? 1,
            trimID: item.trims_data?.pk_trim_id ?? 1,
            yarnID: item.yarn_data?.pk_yarn_id ?? 1,
            itemName: item.item_name ?? "",
            itemDescription: item.item_description ?? "",
            quantity: item.quantity ?? 0,
            unitPrice: Number(item.unit_price) || 0,
            taxRate: taxRate,
          };

          try {
            await createOrderItem(orderItemPayload);
          } catch (err) {
            console.error("[Order Creation] Failed to create order item", err);
          }
        })
      );

      toast.success(
        `Order # ${createdOrder.order_number} created successfully`,
        {
          position: "top-right",
        }
      );
    } catch (err) {
      console.error("[Order Creation] Failed to create order from quote", err);
      toast.error("Failed to create order", { position: "top-right" });
      throw err; // Re-throw to allow parent component to handle
    }
  }, [
    customerId,
    quoteItemsData,
    quoteId,
    itemsTotal,
    taxDue,
    taxRate,
    createOrder,
    createOrderItem,
  ]);

  return {
    createOrderFromQuote,
  };
};
