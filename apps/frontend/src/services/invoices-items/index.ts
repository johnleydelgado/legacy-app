import { apiClient } from "@/lib/axios";
import {
    InvoiceItem,
    PaginatedResponse,
    CreateInvoiceItemDTO,
    UpdateInvoiceItemDTO,
    InvoiceItemsQueryParams
} from "./types";

export class InvoiceItemsService {
    private readonly endpoint = "/api/v1/invoices-items";

    async getAllInvoiceItems(params: InvoiceItemsQueryParams = {}): Promise<PaginatedResponse<InvoiceItem>> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.itemsPerPage) queryParams.append("itemsPerPage", params.itemsPerPage.toString());

        const url = `${this.endpoint}${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;
        return apiClient.get<PaginatedResponse<InvoiceItem>>(url);
    }

    async getInvoiceItemById(id: number): Promise<InvoiceItem> {
        return apiClient.get<InvoiceItem>(`${this.endpoint}/${id}`);
    }

    async getInvoiceItemsByInvoiceId(
        invoiceId: number,
        params: { page?: number; itemsPerPage?: number } = {}
    ): Promise<PaginatedResponse<InvoiceItem>> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.itemsPerPage) queryParams.append("itemsPerPage", params.itemsPerPage.toString());

        const url = `${this.endpoint}/invoice/${invoiceId}${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;
        return apiClient.get<PaginatedResponse<InvoiceItem>>(url);
    }

    async createInvoiceItem(data: CreateInvoiceItemDTO): Promise<InvoiceItem> {
        return apiClient.post<InvoiceItem>(this.endpoint, {
            invoiceID: data.invoiceID,
            productID: data.productID,
            // addressID: data.addressID,
            itemName: data.itemName,
            itemDescription: data.itemDescription,
            // artworkURL: data.artworkURL,
            quantity: data.quantity,
            unitPrice: data.unitPrice,
            taxRate: data.taxRate
        });
    }

    async updateInvoiceItem(id: number, data: UpdateInvoiceItemDTO): Promise<InvoiceItem> {
        const updateData = {
            ...(data.productID !== undefined && { productID: data.productID }),
            // ...(data.addressID !== undefined && { addressID: data.addressID }),
            ...(data.itemName !== undefined && { itemName: data.itemName }),
            ...(data.itemDescription !== undefined && { itemDescription: data.itemDescription }),
            // ...(data.artworkURL !== undefined && { artworkURL: data.artworkURL }),
            ...(data.quantity !== undefined && { quantity: data.quantity }),
            ...(data.unitPrice !== undefined && { unitPrice: data.unitPrice }),
            ...(data.taxRate !== undefined && { taxRate: data.taxRate })
        };

        return apiClient.put<InvoiceItem>(`${this.endpoint}/${id}`, updateData);
    }

    async deleteInvoiceItem(id: number): Promise<void> {
        return apiClient.delete<void>(`${this.endpoint}/${id}`);
    }
}

export const invoiceItemsService = new InvoiceItemsService();
