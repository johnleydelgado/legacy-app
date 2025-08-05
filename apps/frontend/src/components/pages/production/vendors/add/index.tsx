'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Header from '../sections/header';
import { VendorForm, VendorFormUI, emptyVendorForm } from '@/components/pages/production/vendors/forms';
import { vendorsService } from '@/services/vendors';
import { CreateVendorDto, Vendor } from '@/services/vendors/types';
import { useVendorTypes } from '@/hooks/useVendorsType';
import { useVendorServiceCategories } from '@/hooks/useVendorsServiceCategory';
import { useCreateVendor, useUpdateVendor } from '@/hooks/useVendors2';
import { useContactMutations } from '@/hooks/useContacts';
import { useCreateActivityHistory } from '@/hooks/useActivityHistory';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { useAddressMutations } from '@/hooks/useAddresses';
import { Address } from '@/services/addresses/types';
import { updateContact } from '@/services/contacts/contacts.service';
import { VendorFormUIV2 } from '../forms/vendor-form-2';
import { useAllLocationTypes } from '@/hooks/useLocationTypes';

interface AddVendorProps {
    vendorData?: Vendor;
    billingAddressData?: Address;
    shippingAddressData?: Address;
}

const AddVendor = ({ vendorData, billingAddressData, shippingAddressData }: AddVendorProps) => {
    const router = useRouter();

    const addMode = vendorData ? false : true;

    const { fullname } = useSelector((state: RootState) => state.users);

    const { data: vendorTypes } = useVendorTypes({ limit: 30 });
    const { data: serviceCategories } = useVendorServiceCategories({ limit: 30 });
    const { data: locationTypes } = useAllLocationTypes();

    const { mutateAsync: createVendor } = useCreateVendor();
    const { mutateAsync: updateVendor } = useUpdateVendor();
    const { createContact } = useContactMutations();
    const { updateContact } = useContactMutations();

    const { createAddress } = useAddressMutations();
    const { updateAddress } = useAddressMutations();
    
    const handleCreatePipeline = async (data: VendorForm) => {
        try{
            const createdVendor = await createVendor({
                fkVendorTypeId: data.vendor_type_id,
                fkVendorServiceCategoryId: data.vendor_service_category_id,
                location: data.location_type_id,
                status: data.status,
                name: data.name,
                websiteURL: data.website,
                notes: data.notes,
                userOwner: fullname,
            });

            console.log(`'Vendor ID ${createdVendor.pk_vendor_id} created successfully'`);
            toast.success(`'Vendor ID ${createdVendor.pk_vendor_id} created successfully'`);

            const createdContact = await createContact({
                fk_id: createdVendor.pk_vendor_id,
                firstname: data.contact.first_name,
                lastname: data.contact.last_name,
                email: data.contact.email,
                phoneNumber: data.contact.phone_number || "",
                mobileNumber: data.contact.mobile_number || "",
                positionTitle: data.contact.position_title || "---",
                contactType: 'PRIMARY',
                table: 'Vendors',
            });

            console.log(`'Vendor Contact ID ${createdContact.pk_contact_id} created successfully'`);
            toast.success(`'Vendor Contact ID ${createdContact.pk_contact_id} created successfully'`);

            const createdBillingAddress = await createAddress({
                fk_id: createdVendor.pk_vendor_id,
                table: 'Vendors',
                address1: data.billing_address.address1,
                address2: data.billing_address.address2 || "",
                city: data.billing_address.city,
                state: data.billing_address.state,
                zip: data.billing_address.zip,
                country: data.billing_address.country,
                address_type: 'BILLING',
            });

            console.log(`'Vendor Billing Address ID ${createdBillingAddress?.pk_address_id} created successfully'`);
            toast.success(`'Vendor Billing Address ID ${createdBillingAddress?.pk_address_id} created successfully'`);

            const createdShippingAddress = await createAddress({
                fk_id: createdVendor.pk_vendor_id,
                table: 'Vendors',
                address1: data.shipping_address.address1,
                address2: data.shipping_address.address2 || "",
                city: data.shipping_address.city,
                state: data.shipping_address.state,
                zip: data.shipping_address.zip,
                country: data.shipping_address.country,
                address_type: 'SHIPPING',
            });

            console.log(`'Vendor Shipping Address ID ${createdShippingAddress?.pk_address_id} created successfully'`);
            toast.success(`'Vendor Shipping Address ID ${createdShippingAddress?.pk_address_id} created successfully'`);

            return createdVendor;
        } catch (error) {
            console.error('Error creating pipeline:', error);
            toast.error(`Failed to create pipeline: ${error}`);

            return null;
        }
    }

    const handleUpdatePipeline = async (data: VendorForm) => {
        try {
            const updatedVendor = await updateVendor({
                id: vendorData?.pk_vendor_id || 0,
                data: {
                    fkVendorTypeId: data.vendor_type_id,
                    fkVendorServiceCategoryId: data.vendor_service_category_id,
                    status: data.status,
                    name: data.name,
                    websiteURL: data.website,
                    location: data.location_type_id,
                    notes: data.notes,
                },
            });

            if (vendorData?.contact.id) {
                const updatedContact = await updateContact({
                    id: vendorData.contact.id,
                    data: {
                        firstname: data.contact.first_name,
                        lastname: data.contact.last_name,
                        email: data.contact.email,
                        phoneNumber: data.contact.phone_number || "",
                        mobileNumber: data.contact.mobile_number || "",
                        positionTitle: data.contact.position_title || "",
                        contactType: 'PRIMARY',
                    }
                });

                console.log(`'Vendor Contact ID ${updatedContact.pk_contact_id} updated successfully'`);
                toast.success(`'Vendor Contact ID ${updatedContact.pk_contact_id} updated successfully'`);
            } else {
                const createdContact = await createContact({
                    fk_id: updatedVendor.pk_vendor_id,
                    firstname: data.contact.first_name,
                    lastname: data.contact.last_name,
                    email: data.contact.email,
                    phoneNumber: data.contact.phone_number || "",
                    mobileNumber: data.contact.mobile_number || "",
                    positionTitle: data.contact.position_title || "",
                    contactType: 'PRIMARY',
                    table: 'Vendors',
                });

                console.log(`'Vendor Contact ID ${createdContact.pk_contact_id} created successfully'`);
                toast.success(`'Vendor Contact ID ${createdContact.pk_contact_id} created successfully'`);
            }

            if (billingAddressData?.pk_address_id) {
                const updatedBillingAddress = await updateAddress({
                    id: billingAddressData.pk_address_id,
                    data: {
                        address1: data.billing_address.address1,
                        address2: data.billing_address.address2 || "",
                        city: data.billing_address.city,
                        state: data.billing_address.state,
                        zip: data.billing_address.zip,
                        country: data.billing_address.country,
                        address_type: 'BILLING',
                    },
                });

                console.log(`'Vendor Billing Address ID ${updatedBillingAddress?.pk_address_id} updated successfully'`);
                toast.success(`'Vendor Billing Address ID ${updatedBillingAddress?.pk_address_id} updated successfully'`);
            } else {
                const createdBillingAddress = await createAddress({
                    fk_id: updatedVendor.pk_vendor_id,
                    table: 'Vendors',
                    address1: data.billing_address.address1,
                    address2: data.billing_address.address2 || "",
                    city: data.billing_address.city,
                    state: data.billing_address.state,
                    zip: data.billing_address.zip,
                    country: data.billing_address.country,
                    address_type: 'BILLING',
                });

                console.log(`'Vendor Billing Address ID ${createdBillingAddress?.pk_address_id} created successfully'`);
                toast.success(`'Vendor Billing Address ID ${createdBillingAddress?.pk_address_id} created successfully'`);
            }
            
            if (shippingAddressData?.pk_address_id) {
                const updatedShippingAddress = await updateAddress({
                    id: shippingAddressData.pk_address_id,
                    data: {
                        address1: data.shipping_address.address1,
                        address2: data.shipping_address.address2 || "",
                        city: data.shipping_address.city,
                        state: data.shipping_address.state,
                        zip: data.shipping_address.zip,
                        country: data.shipping_address.country,
                        address_type: 'SHIPPING',
                    },
                });

                console.log(`'Vendor Shipping Address ID ${updatedShippingAddress?.pk_address_id} updated successfully'`);
                toast.success(`'Vendor Shipping Address ID ${updatedShippingAddress?.pk_address_id} updated successfully'`);
            } else {
                const createdShippingAddress = await createAddress({
                    fk_id: updatedVendor.pk_vendor_id,
                    table: 'Vendors',
                    address1: data.shipping_address.address1,
                    address2: data.shipping_address.address2 || "",
                    city: data.shipping_address.city,
                    state: data.shipping_address.state,
                    zip: data.shipping_address.zip,
                    country: data.shipping_address.country,
                    address_type: 'SHIPPING',
                });

                console.log(`'Vendor Shipping Address ID ${createdShippingAddress?.pk_address_id} created successfully'`);
                toast.success(`'Vendor Shipping Address ID ${createdShippingAddress?.pk_address_id} created successfully'`);
            }

            return updatedVendor;
        } catch (error) {
            console.error('Error updating pipeline:', error);
            toast.error(`Failed to update pipeline: ${error}`);

            return null;
        }
    }

    const handleSubmit = async (data: VendorForm) => {
        try {
            let vendorID: number | null = null;

            if (addMode) {
                const createdVendor = await handleCreatePipeline(data);
                vendorID = createdVendor?.pk_vendor_id || null;
            } else {
                const updatedVendor = await handleUpdatePipeline(data);
                vendorID = updatedVendor?.pk_vendor_id || null;
            }

            if (vendorID) {
                router.push(`/production/vendors/${vendorID}`);
            } else {
                throw new Error("Failed to create vendor");
            }
        } catch (error) {
            console.error('Error creating vendor:', error);
            toast.error(`Failed to create vendor: ${error}`);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mx-auto p-6 space-y-6">
                <Header addPage={addMode} editPage={!addMode} />
                <VendorFormUIV2
                    mode="create"
                    vendorData={vendorData}
                    billingAddressData={billingAddressData}
                    shippingAddressData={shippingAddressData}
                    initial={emptyVendorForm()}
                    vendorTypes={vendorTypes?.items || []}
                    serviceCategories={serviceCategories?.items || []}
                    locationTypes={locationTypes || []}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    )
}

export default AddVendor;
