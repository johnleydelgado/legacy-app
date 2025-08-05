import { Suspense } from "react";
import { notFound } from "next/navigation";
import ShippingDetails from "@/components/pages/crm/shipping/details";
import { shippingOrdersService } from "@/services/shipping-orders";

interface ShippingDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

// This is a Server Component that fetches data
async function getShippingOrderData(id: string) {
  try {
    console.log("Fetching shipping order with ID:", id);
    const shippingOrder = await shippingOrdersService.getShippingOrderById(
      parseInt(id)
    );
    console.log(
      "Shipping order fetched successfully:",
      shippingOrder ? "Found" : "Not found"
    );
    return shippingOrder;
  } catch (error) {
    console.error("Failed to fetch shipping order:", error);
    return null;
  }
}

export default async function ShippingDetailsPage({
  params,
}: ShippingDetailsPageProps) {
  const { id } = await params;

  // Validate that id is a number
  if (!id || isNaN(parseInt(id))) {
    notFound();
  }

  // Fetch shipping order data on the server
  const shippingOrder = await getShippingOrderData(id);

  if (!shippingOrder) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <ShippingDetails shippingOrder={shippingOrder} />
    </div>
  );
}

// Generate metadata for SEO (optional)
export async function generateMetadata({ params }: ShippingDetailsPageProps) {
  const { id } = await params;

  try {
    const shippingOrder = await getShippingOrderData(id);

    if (!shippingOrder) {
      return {
        title: "Shipping Order Not Found",
        description: "The requested shipping order could not be found.",
      };
    }

    return {
      title: `Shipping Order ${
        shippingOrder.shipping_order_number || `#${id}`
      } - CRM`,
      description: `Shipping order details for ${
        shippingOrder.customer?.name || "customer"
      }`,
    };
  } catch (error) {
    return {
      title: "Shipping Order Details - CRM",
      description: "View shipping order details and manage customer shipments.",
    };
  }
}
