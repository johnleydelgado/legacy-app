import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ProductionOrderKnitColorsResponse,
    ProductionOrderBodyColorsResponse,
    ProductionOrderPackagingResponse,
    CreateProductionOrderKnitColorDto,
    UpdateProductionOrderKnitColorDto,
    CreateProductionOrderBodyColorDto,
    UpdateProductionOrderBodyColorDto,
    CreateProductionOrderPackagingDto,
    UpdateProductionOrderPackagingDto,
} from '@/services/production-orders-colors/types';
import {
    productionOrderKnitColorsService,
    productionOrderBodyColorsService,
    productionOrderPackagingService,
} from '@/services/production-orders-colors';

// Query keys for React Query
export const productionOrderColorsKeys = {
    knitColors: {
        all: ['production-order-knit-colors'] as const,
        lists: () => [...productionOrderColorsKeys.knitColors.all, 'list'] as const,
        active: () => [...productionOrderColorsKeys.knitColors.all, 'active'] as const,
        details: () => [...productionOrderColorsKeys.knitColors.all, 'detail'] as const,
        detail: (id: number) => [...productionOrderColorsKeys.knitColors.details(), id] as const,
    },
    bodyColors: {
        all: ['production-order-body-colors'] as const,
        lists: () => [...productionOrderColorsKeys.bodyColors.all, 'list'] as const,
        active: () => [...productionOrderColorsKeys.bodyColors.all, 'active'] as const,
        details: () => [...productionOrderColorsKeys.bodyColors.all, 'detail'] as const,
        detail: (id: number) => [...productionOrderColorsKeys.bodyColors.details(), id] as const,
    },
    packaging: {
        all: ['production-order-packaging'] as const,
        lists: () => [...productionOrderColorsKeys.packaging.all, 'list'] as const,
        active: () => [...productionOrderColorsKeys.packaging.all, 'active'] as const,
        details: () => [...productionOrderColorsKeys.packaging.all, 'detail'] as const,
        detail: (id: number) => [...productionOrderColorsKeys.packaging.details(), id] as const,
    },
};

// KNIT COLORS HOOKS
export const useProductionOrderKnitColors = (activeOnly: boolean = false) => {
    return useQuery({
        queryKey: activeOnly ? productionOrderColorsKeys.knitColors.active() : productionOrderColorsKeys.knitColors.lists(),
        queryFn: () => activeOnly 
            ? productionOrderKnitColorsService.getActiveKnitColors()
            : productionOrderKnitColorsService.getAllKnitColors(),
        staleTime: 10 * 60 * 1000, // 10 minutes (these don't change often)
        gcTime: 15 * 60 * 1000, // 15 minutes
    });
};

export const useProductionOrderKnitColor = (id: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: productionOrderColorsKeys.knitColors.detail(id),
        queryFn: () => productionOrderKnitColorsService.getKnitColorById(id),
        enabled: enabled && !!id,
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    });
};

export const useCreateKnitColor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductionOrderKnitColorDto) =>
            productionOrderKnitColorsService.createKnitColor(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productionOrderColorsKeys.knitColors.all });
        },
        onError: (error) => {
            console.error('Error creating knit color:', error);
        },
    });
};

export const useUpdateKnitColor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProductionOrderKnitColorDto }) =>
            productionOrderKnitColorsService.updateKnitColor(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: productionOrderColorsKeys.knitColors.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: productionOrderColorsKeys.knitColors.all });
        },
        onError: (error) => {
            console.error('Error updating knit color:', error);
        },
    });
};

export const useDeleteKnitColor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => productionOrderKnitColorsService.deleteKnitColor(id),
        onSuccess: (data, variables) => {
            queryClient.removeQueries({ queryKey: productionOrderColorsKeys.knitColors.detail(variables) });
            queryClient.invalidateQueries({ queryKey: productionOrderColorsKeys.knitColors.all });
        },
        onError: (error) => {
            console.error('Error deleting knit color:', error);
        },
    });
};

// BODY COLORS HOOKS
export const useProductionOrderBodyColors = (activeOnly: boolean = false) => {
    return useQuery({
        queryKey: activeOnly ? productionOrderColorsKeys.bodyColors.active() : productionOrderColorsKeys.bodyColors.lists(),
        queryFn: () => activeOnly 
            ? productionOrderBodyColorsService.getActiveBodyColors()
            : productionOrderBodyColorsService.getAllBodyColors(),
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    });
};

export const useProductionOrderBodyColor = (id: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: productionOrderColorsKeys.bodyColors.detail(id),
        queryFn: () => productionOrderBodyColorsService.getBodyColorById(id),
        enabled: enabled && !!id,
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    });
};

export const useCreateBodyColor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductionOrderBodyColorDto) =>
            productionOrderBodyColorsService.createBodyColor(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productionOrderColorsKeys.bodyColors.all });
        },
        onError: (error) => {
            console.error('Error creating body color:', error);
        },
    });
};

export const useUpdateBodyColor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProductionOrderBodyColorDto }) =>
            productionOrderBodyColorsService.updateBodyColor(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: productionOrderColorsKeys.bodyColors.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: productionOrderColorsKeys.bodyColors.all });
        },
        onError: (error) => {
            console.error('Error updating body color:', error);
        },
    });
};

export const useDeleteBodyColor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => productionOrderBodyColorsService.deleteBodyColor(id),
        onSuccess: (data, variables) => {
            queryClient.removeQueries({ queryKey: productionOrderColorsKeys.bodyColors.detail(variables) });
            queryClient.invalidateQueries({ queryKey: productionOrderColorsKeys.bodyColors.all });
        },
        onError: (error) => {
            console.error('Error deleting body color:', error);
        },
    });
};

// PACKAGING HOOKS
export const useProductionOrderPackaging = (activeOnly: boolean = false) => {
    return useQuery({
        queryKey: activeOnly ? productionOrderColorsKeys.packaging.active() : productionOrderColorsKeys.packaging.lists(),
        queryFn: () => activeOnly 
            ? productionOrderPackagingService.getActivePackaging()
            : productionOrderPackagingService.getAllPackaging(),
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    });
};

export const useProductionOrderPackagingItem = (id: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: productionOrderColorsKeys.packaging.detail(id),
        queryFn: () => productionOrderPackagingService.getPackagingById(id),
        enabled: enabled && !!id,
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    });
};

export const useCreatePackaging = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductionOrderPackagingDto) =>
            productionOrderPackagingService.createPackaging(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productionOrderColorsKeys.packaging.all });
        },
        onError: (error) => {
            console.error('Error creating packaging:', error);
        },
    });
};

export const useUpdatePackaging = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProductionOrderPackagingDto }) =>
            productionOrderPackagingService.updatePackaging(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: productionOrderColorsKeys.packaging.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: productionOrderColorsKeys.packaging.all });
        },
        onError: (error) => {
            console.error('Error updating packaging:', error);
        },
    });
};

export const useDeletePackaging = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => productionOrderPackagingService.deletePackaging(id),
        onSuccess: (data, variables) => {
            queryClient.removeQueries({ queryKey: productionOrderColorsKeys.packaging.detail(variables) });
            queryClient.invalidateQueries({ queryKey: productionOrderColorsKeys.packaging.all });
        },
        onError: (error) => {
            console.error('Error deleting packaging:', error);
        },
    });
};