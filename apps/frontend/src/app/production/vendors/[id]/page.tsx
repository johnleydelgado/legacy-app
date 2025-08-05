import VendorDetails from "@/components/pages/production/vendors/details";
import { vendorsService } from "@/services/vendors";
import { notFound } from "next/navigation";
import * as React from "react";

interface VendorDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const VendorDetailsPage = async ({ params }: VendorDetailsPageProps) => {
  const { id } = await params;

  // Validate that id is a number
  if (!id || isNaN(parseInt(id))) {
    notFound();
  }

  try {
    // Fetch vendor data using the vendors service
    const vendorData = await vendorsService.getVendorById(parseInt(id, 10));

    return <VendorDetails vendorData={vendorData} vendorId={parseInt(id, 10)} />;
  } catch (error) {
    console.error("Failed to fetch vendor:", error);
    notFound();
  }
};

export default VendorDetailsPage;
