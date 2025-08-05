import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContact,
  updateContact,
  deleteContact,
  getContactByReference,
} from "@/services/contacts/contacts.service";
import { ContactReference, CreateContactDto, UpdateContactDto } from "@/services/contacts/types";
import { Contact, ContactType } from "../services/contacts/types";
import { getContactByType } from "../services/contacts/contacts.service";

export const useContactMutations = () => {
  const queryClient = useQueryClient();

  const createContactMutation = useMutation({
    mutationFn: (data: CreateContactDto) => createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateContactDto }) =>
      updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: number) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  return {
    createContact: createContactMutation.mutateAsync,
    updateContact: updateContactMutation.mutateAsync,
    deleteContact: deleteContactMutation.mutateAsync,
    loading:
      createContactMutation.isPending ||
      updateContactMutation.isPending ||
      deleteContactMutation.isPending,
    error:
      createContactMutation.error ||
      updateContactMutation.error ||
      deleteContactMutation.error,
  };
};

interface UseContactByTypeOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: Contact) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to fetch a contact by customer ID and contact type
 * @param customerID - ID of the customer
 * @param contactType - Type of contact (e.g., "BILLING")
 * @param options - Additional React Query options
 * @returns Query result with the contact data
 */
export const useContactByType = (
  customerID: number | string | undefined,
  contactType: ContactType | undefined,
  options: UseContactByTypeOptions = {}
) => {
  return useQuery({
    queryKey: ["contacts", "byType", customerID, contactType],
    queryFn: () => {
      if (!customerID || !contactType) {
        throw new Error("Customer ID and contact type are required");
      }
      return getContactByType(customerID, contactType);
    },
    enabled: !!customerID && !!contactType,
    ...options,
  });
};

interface UseContactByReferenceOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: ContactReference) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to fetch a contact by reference (fk_id and table)
 * @param fkId - Foreign key ID reference
 * @param table - Table name (e.g., "Vendors")
 * @param options - Additional React Query options
 * @returns Query result with the contact reference data
 */
export const useContactByReference = (
  fkId: number | string | undefined,
  table: string | undefined,
  contactType: string | undefined,
  options: UseContactByReferenceOptions = {}
) => {
  return useQuery({
    queryKey: ["contacts", "byReference", fkId, table, contactType],
    queryFn: () => {
      if (!fkId || !table || !contactType) {
        throw new Error("Foreign key ID and table are required");
      }
      return getContactByReference(fkId, table, contactType);
    },
    enabled: !!fkId && !!table && !!contactType,
    ...options,
  });
};
