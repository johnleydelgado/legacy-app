'use client';

import { CustomerFormUI } from '@/components/forms/customer/customer-form';
import { BackHeader } from '@/components/ui/back-header';
import { Toaster } from '@/components/ui/sonner';
import { headerTitle } from '@/constants/HeaderTitle';
import { useCustomerMutations } from '@/hooks/useCustomers';
import { emptyCustomer } from '@/lib/initialData';
import { CreateCustomerDto } from '@/services/customers/types';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';


const CustomerAdd = () => {
    const { add, list } = headerTitle.crmCustomers;
    const router = useRouter();
    const { createCustomer } = useCustomerMutations();
  
    const handleSubmit = async (data: CreateCustomerDto) => {
      try {
        // Format addresses according to the DTO
        const formattedAddresses = data.addresses?.map((addr) => ({
          address1: addr.address1,
          address2: addr.address2 || "",
          city: addr.city,
          state: addr.state,
          zip: addr.zip,
          country: addr.country,
          address_type: addr.address_type,
        }));
  
        // Format contacts according to the DTO
        const formattedContacts = data.contacts?.map((contact) => ({
          firstname: contact.firstname,
          lastname: contact.lastname,
          email: contact.email,
          phoneNumber: contact.phoneNumber || "",
          mobileNumber: contact.mobileNumber || "",
          positionTitle: contact.positionTitle || "",
          contactType: contact.contactType,
        }));
  
        // Prepare the create payload with the correct field names
        const createPayload: CreateCustomerDto = {
          name: data.name,
          ownerName: data.ownerName,
          organizationID: data.organizationID,
          email: data.email,
          phoneNumber: data.phoneNumber,
          mobileNumber: data.mobileNumber,
          websiteURL: data.websiteURL,
          industry: data.industry,
          customerType: data.customerType,
          status: data.status,
          source: data.source,
          convertedAt: data.convertedAt,
          notes: data.notes,
          vatNumber: data.vatNumber,
          taxID: data.taxID,
          tags: data.tags,
          addresses: formattedAddresses,
          contacts: formattedContacts,
        };

        const result = await createCustomer.mutateAsync(createPayload);
  
        // Show success message
        toast.success("Customer created successfully");
  
        // Redirect to customer list on success
        router.push(list.href);
      } catch (err) {
        if (err instanceof Error) {
          toast.error(`Failed to create customer: ${err.message}`);
        } else {
          toast.error("Failed to create customer: Unknown error");
        }
        throw err;
      }
    };
  
    return (
      <div className="space-y-6 px-6">
        {/* <BackHeader href={list.href} title={add.title} /> */}
  
        <CustomerFormUI
          mode="create"
          initial={emptyCustomer()}
          onSubmit={handleSubmit}
        />
      </div>
    );
}

export default CustomerAdd;
