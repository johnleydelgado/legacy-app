import { apiClient } from "@/lib/axios";
import {
    Invoice,
    InvoicesResponse,
    InvoiceKpi,
    GetInvoicesParams,
    GetCustomerInvoicesParams,
    SearchInvoicesParams,
    CreateInvoiceDto,
    UpdateInvoiceDto,
    DeleteInvoiceResponse
} from "@/services/invoices/types";

export class InvoiceService {
    private readonly endpoint = "/api/v1/invoices";

    /**
     * Get all invoices with pagination
     */
    async getInvoices(params: GetInvoicesParams = {}): Promise<InvoicesResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const url = `${this.endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        return apiClient.get<InvoicesResponse>(url);
    }

    /**
     * Get invoice KPI data
     */
    async getInvoiceKpi(): Promise<InvoiceKpi> {
        return apiClient.get<InvoiceKpi>(`${this.endpoint}/kpi`);
    }

    /**
     * Get a specific invoice by ID
     */
    async getInvoiceById(id: number): Promise<Invoice> {
        return apiClient.get<Invoice>(`${this.endpoint}/${id}`);
    }

    /**
     * Get invoices by customer ID with pagination
     */
    async getCustomerInvoices(params: GetCustomerInvoicesParams): Promise<InvoicesResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const url = `${this.endpoint}/customer/${params.customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        return apiClient.get<InvoicesResponse>(url);
    }

    /**
     * Search invoices with pagination
     */
    async searchInvoices(params: SearchInvoicesParams = {}): Promise<InvoicesResponse> {
        const queryParams = new URLSearchParams();

        if (params.q) queryParams.append('q', params.q);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const url = `${this.endpoint}/search?${queryParams.toString()}`;

        return apiClient.get<InvoicesResponse>(url);
    }

    /**
     * Create a new invoice
     */
    async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
        return apiClient.post<Invoice>(this.endpoint, data);
    }

    /**
     * Update an existing invoice
     */
    async updateInvoice(id: number, data: UpdateInvoiceDto): Promise<Invoice> {
        return apiClient.put<Invoice>(`${this.endpoint}/${id}`, data);
    }

    /**
     * Delete an invoice
     */
    async deleteInvoice(id: number): Promise<DeleteInvoiceResponse> {
        return apiClient.delete<DeleteInvoiceResponse>(`${this.endpoint}/${id}`);
    }
}

export const invoiceService = new InvoiceService();
