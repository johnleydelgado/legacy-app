import * as React from "react";
import AddVendor from "@/components/pages/production/vendors/add";
import { vendorsService } from "@/services/vendors";
import { addressService } from "@/services/addresses";
import { AddressTypeEnums } from "@/services/addresses/types";


interface VendorEditPageProps {
    params: Promise<{
      id: string;
    }>;
  }

const EditVendorPage = async ({ params }: VendorEditPageProps) => {
    const { id } = await params;

    const vendorData = await vendorsService.getVendorById(Number(id));
    const billingAddressData = await addressService.getAddressByForeignKey({
        fk_id: Number(id),
        table: "Vendors",
        address_type: AddressTypeEnums.BILLING
    });
    const shippingAddressData = await addressService.getAddressByForeignKey({
        fk_id: Number(id),
        table: "Vendors",
        address_type: AddressTypeEnums.SHIPPING
    });

    return <AddVendor vendorData={vendorData} billingAddressData={billingAddressData} shippingAddressData={shippingAddressData} />
}

export default EditVendorPage;
