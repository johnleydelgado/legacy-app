import { useState, useEffect, useCallback } from 'react';
import {
    ImageGallery,
    CreateImageGalleryParams,
    CreateImageGalleryFromUrlParams,
    UpdateImageGalleryParams,
    PaginationParams,
    PaginatedResponse,
    DeleteResponse,
    ImageGalleryQueryParams
} from '@/services/image-gallery/types';
import { imageGalleryService } from '@/services/image-gallery';

/**
 * Hook for fetching a paginated list of image gallery items
 */
export const useImageGalleryList = (initialParams: ImageGalleryQueryParams = {}) => {
    const [data, setData] = useState<PaginatedResponse<ImageGallery> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [params, setParams] = useState<ImageGalleryQueryParams>(initialParams);

    const fetchImages = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await imageGalleryService.getAll(params);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    return {
        data,
        loading,
        error,
        refetch: fetchImages,
        setParams
    };
};

/**
 * Hook for fetching images by item ID and type
 */
export const useImageGalleryByItem = (itemId: number | null, itemType: string | null, initialParams: PaginationParams = {}) => {
    const [data, setData] = useState<PaginatedResponse<ImageGallery> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [params, setParams] = useState<PaginationParams>(initialParams);

    const fetchImages = useCallback(async () => {
        if (itemId === null || itemType === null) return;

        try {
            setLoading(true);
            setError(null);
            const result = await imageGalleryService.getByItem(itemId, itemType, params);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [itemId, itemType, params]);

    useEffect(() => {
        if (itemId !== null && itemType !== null) {
            fetchImages();
        } else {
            setData(null);
        }
    }, [itemId, itemType, fetchImages]);

    return {
        data,
        loading,
        error,
        refetch: fetchImages,
        setParams
    };
};

/**
 * Hook for fetching images by item using the dedicated endpoint
 */
export const useImageGalleryByItemEndpoint = (fkItemID: number | null, fkItemType: string | null, initialParams: PaginationParams = {}) => {
    const [data, setData] = useState<PaginatedResponse<ImageGallery> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [params, setParams] = useState<PaginationParams>(initialParams);

    const fetchImages = useCallback(async () => {
        if (fkItemID === null || fkItemType === null) return;

        try {
            setLoading(true);
            setError(null);
            const result = await imageGalleryService.getByItemEndpoint(fkItemID, fkItemType, params);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [fkItemID, fkItemType, params]);

    useEffect(() => {
        if (fkItemID !== null && fkItemType !== null) {
            fetchImages();
        } else {
            setData(null);
        }
    }, [fkItemID, fkItemType, fetchImages]);

    return {
        data,
        loading,
        error,
        refetch: fetchImages,
        setParams
    };
};

/**
 * Hook for fetching a single image gallery item by ID
 */
export const useImageGallery = (id: number | null) => {
    const [data, setData] = useState<ImageGallery | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchImage = useCallback(async () => {
        if (id === null) return;

        try {
            setLoading(true);
            setError(null);
            const result = await imageGalleryService.getById(id);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id !== null) {
            fetchImage();
        } else {
            setData(null);
        }
    }, [id, fetchImage]);

    return {
        data,
        loading,
        error,
        refetch: fetchImage
    };
};

/**
 * Hook for creating a new image gallery item
 */
export const useCreateImageGallery = () => {
    const [data, setData] = useState<ImageGallery | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const createImage = async (params: CreateImageGalleryParams) => {
        try {
            setLoading(true);
            setError(null);
            const result = await imageGalleryService.create(params);
            setData(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(new Error(errorMessage));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        createImage
    };
};

/**
 * Hook for creating a new image gallery item from URL
 */
export const useCreateImageGalleryFromUrl = () => {
    const [data, setData] = useState<ImageGallery | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const createImageFromUrl = async (params: CreateImageGalleryFromUrlParams) => {
        try {
            setLoading(true);
            setError(null);
            const result = await imageGalleryService.createFromUrl(params);
            setData(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(new Error(errorMessage));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        createImageFromUrl
    };
};

/**
 * Hook for bulk creating multiple image gallery items
 */
export const useBulkCreateImageGallery = () => {
    const [data, setData] = useState<ImageGallery[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const bulkCreateImages = async (params: CreateImageGalleryParams[]) => {
        try {
            setLoading(true);
            setError(null);
            const result = await imageGalleryService.bulkCreate(params);
            setData(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(new Error(errorMessage));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        bulkCreateImages
    };
};

/**
 * Hook for updating an existing image gallery item
 */
export const useUpdateImageGallery = () => {
    const [data, setData] = useState<ImageGallery | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const updateImage = async (id: number, params: UpdateImageGalleryParams) => {
        try {
            setLoading(true);
            setError(null);
            const result = await imageGalleryService.update(id, params);
            setData(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(new Error(errorMessage));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        updateImage
    };
};

/**
 * Hook for bulk updating multiple image gallery items
 */
export const useBulkUpdateImageGallery = () => {
    const [data, setData] = useState<ImageGallery[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const bulkUpdateImages = async (updates: { id: number; params: UpdateImageGalleryParams }[]) => {
        try {
            setLoading(true);
            setError(null);
            const result = await imageGalleryService.bulkUpdate(updates);
            setData(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(new Error(errorMessage));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        bulkUpdateImages
    };
};

/**
 * Hook for deleting an image gallery item
 */
export const useDeleteImageGallery = () => {
    const [data, setData] = useState<DeleteResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const deleteImage = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const result = await imageGalleryService.delete(id);
            setData(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(new Error(errorMessage));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        deleteImage
    };
};

/**
 * Hook for bulk deleting multiple image gallery items
 */
export const useBulkDeleteImageGallery = () => {
    const [data, setData] = useState<DeleteResponse[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const bulkDeleteImages = async (ids: number[]) => {
        try {
            setLoading(true);
            setError(null);
            const result = await imageGalleryService.bulkDelete(ids);
            setData(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(new Error(errorMessage));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        bulkDeleteImages
    };
};
