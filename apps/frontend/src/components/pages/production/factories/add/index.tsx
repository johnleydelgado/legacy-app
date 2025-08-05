'use client';

import * as React from 'react';
import Header from '../sections/header';
import { FactoryFormUIV2 } from '../forms/factories-form-2';
import { emptyFactoryForm } from '../forms';
import { useAllLocationTypes } from '@/hooks/useLocationTypes';
import { FactoryForm } from '../forms/types';
import { useVendorTypes } from '@/hooks/useVendorsType';
import { useVendorServiceCategories } from '@/hooks/useVendorsServiceCategory';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { useCreateFactory, useUpdateFactory } from '@/hooks/useFactories';
import { useContactMutations } from '@/hooks/useContacts';
import { useAddressMutations } from '@/hooks/useAddresses';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Factory } from '@/services/factories/types';
import { Address } from '@/services/addresses/types';

interface AddFactoryProps {
    factoryData?: Factory;
    billingAddressData?: Address;
    shippingAddressData?: Address;
}

const AddFactory = ({ factoryData, billingAddressData, shippingAddressData }: AddFactoryProps) => {
    const router = useRouter();

    const addMode = !factoryData;
    
    const { data: factoryTypes } = useVendorTypes();
    const { data: factoryServiceCategories } = useVendorServiceCategories();
    const { data: locationTypes } = useAllLocationTypes();

    const { fullname } = useSelector((state: RootState) => state.users);

    const { mutateAsync: createFactory } = useCreateFactory();
    const { mutateAsync: updateFactory } = useUpdateFactory();

    const { createContact } = useContactMutations();
    const { updateContact } = useContactMutations();

    const { createAddress } = useAddressMutations();
    const { updateAddress } = useAddressMutations();

    const handleCreatePipeline = async (data: FactoryForm) => {
        try {
            const createdFactory = await createFactory({
                fkFactoriesTypeId: data.factory_type_id,
                fkFactoriesServiceCategoryId: data.factory_service_category_id,
                fkLocationId: data.location_type_id,
                status: data.status,
                name: data.name,
                websiteURL: data.website,
                industry: data.industry,
                notes: data.notes,
                userOwner: fullname,
            });

            console.log(`'Factory ID ${createdFactory.pk_factories_id} created successfully'`);
            toast.success(`'Factory ID ${createdFactory.pk_factories_id} created successfully'`);

            const createdContact = await createContact({
                fk_id: createdFactory.pk_factories_id,
                firstname: data.contact.first_name,
                lastname: data.contact.last_name,
                email: data.contact.email,
                phoneNumber: data.contact.phone_number || "",
                mobileNumber: data.contact.mobile_number || "",
                positionTitle: data.contact.position_title || "---",
                contactType: 'PRIMARY',
                table: 'Factories',
            });

            console.log(`'Factory Contact ID ${createdContact.pk_contact_id} created successfully'`);
            toast.success(`'Factory Contact ID ${createdContact.pk_contact_id} created successfully'`);

            const createdBillingAddress = await createAddress({
                fk_id: createdFactory.pk_factories_id,
                table: 'Factories',
                address1: data.billing_address.address1,
                address2: data.billing_address.address2 || "",
                city: data.billing_address.city,
                state: data.billing_address.state,
                zip: data.billing_address.zip,
                country: data.billing_address.country,
                address_type: 'BILLING',
            });

            console.log(`'Factory Billing Address ID ${createdBillingAddress?.pk_address_id} created successfully'`);
            toast.success(`'Factory Billing Address ID ${createdBillingAddress?.pk_address_id} created successfully'`);

            const createdShippingAddress = await createAddress({
                fk_id: createdFactory.pk_factories_id,
                table: 'Factories',
                address1: data.shipping_address.address1,
                address2: data.shipping_address.address2 || "",
                city: data.shipping_address.city,
                state: data.shipping_address.state,
                zip: data.shipping_address.zip,
                country: data.shipping_address.country,
                address_type: 'SHIPPING',
            });

            console.log(`'Factory Shipping Address ID ${createdShippingAddress?.pk_address_id} created successfully'`);
            toast.success(`'Factory Shipping Address ID ${createdShippingAddress?.pk_address_id} created successfully'`);
        
            return createdFactory;
        
        } catch (error) {
            console.error(`Failed to create factory got ${error}`);
            toast.error(`Failed to create factory got ${error}`);

            return null;
        }
    }

    const handleUpdatePipeline = async (data: FactoryForm) => {
        try {
            const updatedFactory = await updateFactory({
                id: factoryData?.pk_factories_id || 0,
                data: {
                    fkFactoriesTypeId: data.factory_type_id,
                    fkFactoriesServiceCategoryId: data.factory_service_category_id,
                    fkLocationId: data.location_type_id,
                    status: data.status,
                    name: data.name,
                    websiteURL: data.website,
                    industry: data.industry,
                    notes: data.notes,
                },
            });

            if (factoryData && factoryData.contact.id) {
                const updatedContact = await updateContact({
                    id: factoryData.contact.id,
                    data: {
                        firstname: data.contact.first_name,
                        lastname: data.contact.last_name,
                        email: data.contact.email,
                        phoneNumber: data.contact.phone_number || "",
                        mobileNumber: data.contact.mobile_number || "",
                        positionTitle: data.contact.position_title || "---",
                        contactType: 'PRIMARY',
                    },
                });

                console.log(`'Factory Contact ID ${updatedContact.pk_contact_id} updated successfully'`);
                toast.success(`'Factory Contact ID ${updatedContact.pk_contact_id} updated successfully'`);
            } else {
                const createdContact = await createContact({
                    fk_id: updatedFactory.pk_factories_id,
                    firstname: data.contact.first_name,
                    lastname: data.contact.last_name,
                    email: data.contact.email,
                    phoneNumber: data.contact.phone_number || "",
                    mobileNumber: data.contact.mobile_number || "",
                    positionTitle: data.contact.position_title || "---",
                    contactType: 'PRIMARY',
                    table: 'Factories',
                });

                console.log(`'Factory Contact ID ${createdContact.pk_contact_id} created successfully'`);
                toast.success(`'Factory Contact ID ${createdContact.pk_contact_id} created successfully'`);
            }

            if (billingAddressData && billingAddressData.pk_address_id) {
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

                console.log(`'Factory Billing Address ID ${updatedBillingAddress?.pk_address_id} updated successfully'`);
                toast.success(`'Factory Billing Address ID ${updatedBillingAddress?.pk_address_id} updated successfully'`);
            } else {
                const createdBillingAddress = await createAddress({
                    fk_id: updatedFactory.pk_factories_id,
                    table: 'Factories',
                    address1: data.billing_address.address1,
                    address2: data.billing_address.address2 || "",
                    city: data.billing_address.city,
                    state: data.billing_address.state,
                    zip: data.billing_address.zip,
                    country: data.billing_address.country,
                    address_type: 'BILLING',
                });

                console.log(`'Factory Billing Address ID ${createdBillingAddress?.pk_address_id} created successfully'`);
                toast.success(`'Factory Billing Address ID ${createdBillingAddress?.pk_address_id} created successfully'`);
            }

            if (shippingAddressData && shippingAddressData.pk_address_id) {
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

                console.log(`'Factory Shipping Address ID ${updatedShippingAddress?.pk_address_id} updated successfully'`);
                toast.success(`'Factory Shipping Address ID ${updatedShippingAddress?.pk_address_id} updated successfully'`);
            } else {
                const createdShippingAddress = await createAddress({
                    fk_id: updatedFactory.pk_factories_id,
                    table: 'Factories',
                    address1: data.shipping_address.address1,
                    address2: data.shipping_address.address2 || "",
                    city: data.shipping_address.city,
                    state: data.shipping_address.state,
                    zip: data.shipping_address.zip,
                    country: data.shipping_address.country,
                    address_type: 'SHIPPING',
                });

                console.log(`'Factory Shipping Address ID ${createdShippingAddress?.pk_address_id} created successfully'`);
                toast.success(`'Factory Shipping Address ID ${createdShippingAddress?.pk_address_id} created successfully'`);
            }

            return updatedFactory;
        } catch (error) {
            console.error(`Failed to update factory got ${error}`);
            toast.error(`Failed to update factory got ${error}`);

            return null;
        }
    }

    const handleSubmit = async (data: FactoryForm) => {
        try {
            let factoryID: number | null = null;

            if (addMode) {
                const createdFactory = await handleCreatePipeline(data);
                factoryID = createdFactory?.pk_factories_id || null;
            } else {
                const updatedFactory = await handleUpdatePipeline(data);
                factoryID = updatedFactory?.pk_factories_id || null;
            }

            if (factoryID) {
                router.push(`/production/factories/${factoryID}`);
            } else {
                throw new Error("Failed to create factory");
            }
            
        } catch (error) {
            console.error(`Failed to create factory got ${error}`);
            toast.error(`Failed to create factory got ${error}`);
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mx-auto p-6 space-y-6">
                <Header addPage={addMode} editPage={!addMode} />
                <FactoryFormUIV2
                    mode={addMode ? "create" : "edit"}
                    factoryData={factoryData}
                    billingAddressData={billingAddressData}
                    shippingAddressData={shippingAddressData}
                    initial={emptyFactoryForm()}
                    factoryTypes={factoryTypes?.items || []}
                    factoryServiceCategories={factoryServiceCategories?.items || []}
                    locationTypes={locationTypes || []}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    )
}


export default AddFactory;
