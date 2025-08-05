import { apiClient } from "@/lib/axios";
import { Contact, ContactReference, CreateContactDto, UpdateContactDto } from "./types";

// Enhanced error types for better error handling
export class ContactsServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ContactsServiceError';
  }
}

export class ContactValidationError extends ContactsServiceError {
  constructor(message: string, public validationErrors?: Record<string, string[]>) {
    super(message, 400);
    this.name = 'ContactValidationError';
  }
}

export class ContactNotFoundError extends ContactsServiceError {
  constructor(contactId?: number | string) {
    super(
      contactId ? `Contact with ID ${contactId} not found` : 'Contact not found',
      404
    );
    this.name = 'ContactNotFoundError';
  }
}

export const createContact = async (
  data: CreateContactDto
): Promise<Contact> => {
  try {
    // Validate required fields before making the request
    if (!data.email || !data.firstname || !data.lastname) {
      throw new ContactValidationError(
        "Missing required fields: email, firstname, and lastname are required"
      );
    }

    return await apiClient.post<Contact>("/api/v1/contacts", data);
  } catch (error: any) {
    console.log("error:", error);

    // Handle validation errors (400)
    if (error.response?.status === 400) {
      const validationErrors = error.response?.data?.validation || {};
      throw new ContactValidationError(
        error.response?.data?.message || "Invalid contact data",
        validationErrors
      );
    }

    // Handle other HTTP errors
    if (error.response?.status) {
      throw new ContactsServiceError(
        error.response?.data?.message || `Failed to create contact (${error.response.status})`,
        error.response.status,
        error
      );
    }

    // Handle network/unknown errors
    throw new ContactsServiceError(
      "Network error: Unable to create contact. Please check your connection and try again.",
      undefined,
      error
    );
  }
};

export const updateContact = async (
  id: number,
  data: UpdateContactDto
): Promise<Contact> => {
  try {
    // Validate ID
    if (!id || id <= 0) {
      throw new ContactValidationError("Invalid contact ID provided");
    }

    return await apiClient.put<Contact>(`/api/v1/contacts/${id}`, data);
  } catch (error: any) {
    // Handle not found errors (404)
    if (error.response?.status === 404) {
      throw new ContactNotFoundError(id);
    }

    // Handle validation errors (400)
    if (error.response?.status === 400) {
      const validationErrors = error.response?.data?.validation || {};
      throw new ContactValidationError(
        error.response?.data?.message || "Invalid contact update data",
        validationErrors
      );
    }

    // Handle other HTTP errors
    if (error.response?.status) {
      throw new ContactsServiceError(
        error.response?.data?.message || `Failed to update contact (${error.response.status})`,
        error.response.status,
        error
      );
    }

    // Handle network/unknown errors
    throw new ContactsServiceError(
      "Network error: Unable to update contact. Please check your connection and try again.",
      undefined,
      error
    );
  }
};

export const deleteContact = async (id: number): Promise<void> => {
  try {
    // Validate ID
    if (!id || id <= 0) {
      throw new ContactValidationError("Invalid contact ID provided");
    }

    await apiClient.delete<void>(`/api/v1/contacts/${id}`);
  } catch (error: any) {
    // Handle not found errors (404)
    if (error.response?.status === 404) {
      throw new ContactNotFoundError(id);
    }

    // Handle other HTTP errors
    if (error.response?.status) {
      throw new ContactsServiceError(
        error.response?.data?.message || `Failed to delete contact (${error.response.status})`,
        error.response.status,
        error
      );
    }

    // Handle network/unknown errors
    throw new ContactsServiceError(
      "Network error: Unable to delete contact. Please check your connection and try again.",
      undefined,
      error
    );
  }
};

/**
 * Get a contact by customer ID and contact type
 * @param customerID - ID of the customer
 * @param contactType - Type of contact (e.g., "BILLING")
 * @returns Promise with the contact data
 */
export const getContactByType = async (
  customerID: number | string,
  contactType: string
): Promise<Contact> => {
  try {
    // Validate parameters
    if (!customerID) {
      throw new ContactValidationError("Customer ID is required");
    }
    if (!contactType || !contactType.trim()) {
      throw new ContactValidationError("Contact type is required");
    }

    return await apiClient.get<Contact>(
      `/api/v1/contacts/types/${customerID}/${encodeURIComponent(contactType)}`
    );
  } catch (error: any) {
    // Handle not found errors (404)
    if (error.response?.status === 404) {
      throw new ContactNotFoundError(`${contactType} contact for customer ${customerID}`);
    }

    // Handle other HTTP errors
    if (error.response?.status) {
      throw new ContactsServiceError(
        error.response?.data?.message || 
        `Failed to fetch ${contactType} contact for customer ${customerID} (${error.response.status})`,
        error.response.status,
        error
      );
    }

    // Handle network/unknown errors
    throw new ContactsServiceError(
      "Network error: Unable to fetch contact. Please check your connection and try again.",
      undefined,
      error
    );
  }
};

/**
 * Get contacts by reference (fk_id and table)
 * @param fkId - Foreign key ID reference
 * @param table - Table name (e.g., "Vendors")
 * @param contactType - Type of contact
 * @returns Promise with the contact reference data
 */
export const getContactByReference = async (
  fkId: number | string,
  table: string,
  contactType: string
): Promise<ContactReference> => {
  try {
    // Validate parameters
    if (!fkId) {
      throw new ContactValidationError("Foreign key ID is required");
    }
    if (!table || !table.trim()) {
      throw new ContactValidationError("Table reference is required");
    }
    if (!contactType || !contactType.trim()) {
      throw new ContactValidationError("Contact type is required");
    }

    return await apiClient.get<ContactReference>(
      `/api/v1/contacts/by-reference/${fkId}/${encodeURIComponent(table)}/${encodeURIComponent(contactType)}`
    );
  } catch (error: any) {
    // Handle not found errors (404)
    if (error.response?.status === 404) {
      throw new ContactNotFoundError(`${contactType} contact for ${table} ID ${fkId}`);
    }

    // Handle other HTTP errors
    if (error.response?.status) {
      throw new ContactsServiceError(
        error.response?.data?.message || 
        `Failed to fetch contact for reference ${fkId} in ${table} (${error.response.status})`,
        error.response.status,
        error
      );
    }

    // Handle network/unknown errors
    throw new ContactsServiceError(
      "Network error: Unable to fetch contact reference. Please check your connection and try again.",
      undefined,
      error
    );
  }
};
