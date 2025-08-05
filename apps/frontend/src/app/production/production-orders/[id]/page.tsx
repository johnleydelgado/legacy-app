import * as React from "react";
import ProductionOrdersDetails from "@/components/pages/production/production-orders/details";

interface ProductionOrdersDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function ProductionOrdersDetailsPage({
  params,
}: ProductionOrdersDetailsPageProps) {
  const { id } = await params;

  // For now, we'll just pass the ID to the component
  // Later when we have backend, we can fetch data here
  return (
    <div className="min-h-screen">
      <ProductionOrdersDetails productionOrderId={id} />
    </div>
  );
}

// Generate metadata for SEO (optional)
export async function generateMetadata({ params }: ProductionOrdersDetailsPageProps) {
  const { id } = await params;

  return {
    title: `Production Order #${id} - Production`,
    description: `Production order details for order #${id}`,
  };
}