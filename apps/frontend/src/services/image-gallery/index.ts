import { apiClient } from "@/lib/axios";
import {
    ImageGallery,
    CreateImageGalleryParams,
    CreateImageGalleryFromUrlParams,
    UpdateImageGalleryParams,
    PaginationParams,
    PaginatedResponse,
    DeleteResponse,
    ImageGalleryQueryParams
} from './types';

export class ImageGalleryService {
    private readonly endpoint = "/api/v1/image-gallery";

    /**
     * Fetch all images with pagination and filters
     */
    async getAll(params: ImageGalleryQueryParams = {}): Promise<PaginatedResponse<ImageGallery>> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.fk_item_id) queryParams.append("fk_item_id", params.fk_item_id.toString());
        if (params.fk_item_type) queryParams.append("fk_item_type", params.fk_item_type);
        if (params.type) queryParams.append("type", params.type);

        const url = `${this.endpoint}${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        return apiClient.get<PaginatedResponse<ImageGallery>>(url);
    }

    /**
     * Fetch a single image by ID
     */
    async getById(id: number): Promise<ImageGallery> {
        return apiClient.get<ImageGallery>(`${this.endpoint}/${id}`);
    }

    /**
     * Get images by item ID and type
     */
    async getByItem(itemId: number, itemType: string, params: PaginationParams = {}): Promise<PaginatedResponse<ImageGallery>> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        queryParams.append("fk_item_id", itemId.toString());
        queryParams.append("fk_item_type", itemType);

        const url = `${this.endpoint}${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        return apiClient.get<PaginatedResponse<ImageGallery>>(url);
    }

    /**
     * Get images by item using the dedicated endpoint
     */
    async getByItemEndpoint(fkItemID: number, fkItemType: string, params: PaginationParams = {}): Promise<PaginatedResponse<ImageGallery>> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        queryParams.append("fkItemID", fkItemID.toString());
        queryParams.append("fkItemType", fkItemType);

        const url = `${this.endpoint}/by-item${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        return apiClient.get<PaginatedResponse<ImageGallery>>(url);
    }

    /**
     * Create a new image gallery entry
     */
    async create(params: CreateImageGalleryParams): Promise<ImageGallery> {
        const formData = new FormData();
        formData.append('fkItemID', params.fkItemID.toString());
        formData.append('fkItemType', params.fkItemType);
        formData.append('imageFile', params.imageFile);
        formData.append('description', params.description);
        formData.append('type', params.type);

        return apiClient.post<ImageGallery>(this.endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // Increased timeout from 10000ms to 30000ms (30 seconds)
        });
    }

    /**
     * Create a new image gallery entry from URL
     */
    async createFromUrl(params: CreateImageGalleryFromUrlParams): Promise<ImageGallery> {
        return apiClient.post<ImageGallery>(`${this.endpoint}/url`, {
            url: params.url,
            fkItemID: params.fkItemID,
            fkItemType: params.fkItemType,
            description: params.description,
            type: params.type,
        });
    }

    /**
     * Update an existing image gallery entry
     */
    async update(id: number, params: UpdateImageGalleryParams): Promise<ImageGallery> {
        const formData = new FormData();

        // Only append properties that are defined
        if (params.url) formData.append('url', params.url);
        if (params.filename) formData.append('filename', params.filename);
        if (params.file_extension) formData.append('file_extension', params.file_extension);
        if (params.type) formData.append('type', params.type);
        if (params.imageFile) formData.append('imageFile', params.imageFile);

        return apiClient.put<ImageGallery>(`${this.endpoint}/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    /**
     * Delete an image gallery entry
     */
    async delete(id: number): Promise<DeleteResponse> {
        return apiClient.delete<DeleteResponse>(`${this.endpoint}/${id}`);
    }

    /**
     * Bulk operations
     */
    async bulkCreate(items: CreateImageGalleryParams[]): Promise<ImageGallery[]> {
        const promises = items.map(item => this.create(item));
        return Promise.all(promises);
    }

    async bulkUpdate(updates: { id: number; params: UpdateImageGalleryParams }[]): Promise<ImageGallery[]> {
        const promises = updates.map(update => this.update(update.id, update.params));
        return Promise.all(promises);
    }

    async bulkDelete(ids: number[]): Promise<DeleteResponse[]> {
        const promises = ids.map(id => this.delete(id));
        return Promise.all(promises);
    }
}

export const imageGalleryService = new ImageGalleryService();
