import * as React from "react";
import AddVendor from "@/components/pages/production/vendors/add";
import { vendorsService } from "@/services/vendors";
import { addressService } from "@/services/addresses";
import { AddressTypeEnums } from "@/services/addresses/types";
import { factoriesService } from "@/services/factories";
import AddFactory from "@/components/pages/production/factories/add";


interface FactoryEditPageProps {
    params: Promise<{
      id: string;
    }>;
  }

const EditFactoryPage = async ({ params }: FactoryEditPageProps) => {
    const { id } = await params;

    const factoryData = await factoriesService.getFactoryById(Number(id));
    const billingAddressData = await addressService.getAddressByForeignKey({
        fk_id: Number(id),
        table: "Factories",
        address_type: AddressTypeEnums.BILLING
    });
    const shippingAddressData = await addressService.getAddressByForeignKey({
        fk_id: Number(id),
        table: "Factories",
        address_type: AddressTypeEnums.SHIPPING
    });

    return <AddFactory factoryData={{
        ...factoryData,
        factories_service_category: factoryData.factories_service,
    }} billingAddressData={billingAddressData} shippingAddressData={shippingAddressData} />
}

export default EditFactoryPage;
