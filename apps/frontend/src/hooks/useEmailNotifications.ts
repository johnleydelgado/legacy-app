import { useState, useEffect, useCallback } from "react";
import { emailNotificationsService } from "@/services/email-notifications";
import {
  EmailNotification,
  EmailNotificationsResponse,
  EmailNotificationsQueryParams,
  CreateEmailNotificationDto,
  UpdateEmailNotificationDto,
  EmailNotificationResponse,
} from "@/services/email-notifications/types";

// Hook for fetching email notifications with pagination
interface UseEmailNotificationsResult {
  data: EmailNotificationsResponse | null;
  isLoading: boolean;
  error: Error | null;
  fetchEmailNotifications: (
    params?: EmailNotificationsQueryParams
  ) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useEmailNotifications = (
  initialParams: EmailNotificationsQueryParams = {}
): UseEmailNotificationsResult => {
  const [data, setData] = useState<EmailNotificationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [queryParams, setQueryParams] =
    useState<EmailNotificationsQueryParams>(initialParams);

  const fetchEmailNotifications = useCallback(
    async (params?: EmailNotificationsQueryParams) => {
      try {
        setIsLoading(true);
        setError(null);

        const newParams = params ?? queryParams;
        setQueryParams(newParams);

        const response = await emailNotificationsService.getEmailNotifications(
          newParams
        );
        setData(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch email notifications")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [queryParams]
  );

  const refetch = useCallback(async () => {
    await fetchEmailNotifications();
  }, [fetchEmailNotifications]);

  useEffect(() => {
    fetchEmailNotifications();
  }, []);

  return { data, isLoading, error, fetchEmailNotifications, refetch };
};

// Hook for fetching a single email notification
interface UseEmailNotificationResult {
  data: EmailNotification | null;
  isLoading: boolean;
  error: Error | null;
  fetchEmailNotification: (id: number) => Promise<void>;
}

export const useEmailNotification = (
  initialId?: number
): UseEmailNotificationResult => {
  const [data, setData] = useState<EmailNotification | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!initialId);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmailNotification = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await emailNotificationsService.getEmailNotificationById(
        id
      );
      setData(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error(`Failed to fetch email notification with id ${id}`)
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialId) {
      fetchEmailNotification(initialId);
    }
  }, [initialId, fetchEmailNotification]);

  return { data, isLoading, error, fetchEmailNotification };
};

// Hook for creating email notifications
interface UseCreateEmailNotificationResult {
  isLoading: boolean;
  error: Error | null;
  createEmailNotification: (
    data: CreateEmailNotificationDto
  ) => Promise<EmailNotification | null>;
}

export const useCreateEmailNotification =
  (): UseCreateEmailNotificationResult => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const createEmailNotification = useCallback(
      async (
        data: CreateEmailNotificationDto
      ): Promise<EmailNotification | null> => {
        try {
          setIsLoading(true);
          setError(null);

          const response =
            await emailNotificationsService.createEmailNotification(data);
          return response.data;
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err
              : new Error("Failed to create email notification");
          setError(errorMessage);
          return null;
        } finally {
          setIsLoading(false);
        }
      },
      []
    );

    return { isLoading, error, createEmailNotification };
  };

// Hook for updating email notifications
interface UseUpdateEmailNotificationResult {
  isLoading: boolean;
  error: Error | null;
  updateEmailNotification: (
    id: number,
    data: UpdateEmailNotificationDto
  ) => Promise<EmailNotification | null>;
}

export const useUpdateEmailNotification =
  (): UseUpdateEmailNotificationResult => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const updateEmailNotification = useCallback(
      async (
        id: number,
        data: UpdateEmailNotificationDto
      ): Promise<EmailNotification | null> => {
        try {
          setIsLoading(true);
          setError(null);

          const response =
            await emailNotificationsService.updateEmailNotification(id, data);
          return response.data;
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err
              : new Error("Failed to update email notification");
          setError(errorMessage);
          return null;
        } finally {
          setIsLoading(false);
        }
      },
      []
    );

    return { isLoading, error, updateEmailNotification };
  };

// Hook for deleting email notifications
interface UseDeleteEmailNotificationResult {
  isLoading: boolean;
  error: Error | null;
  deleteEmailNotification: (id: number) => Promise<boolean>;
}

export const useDeleteEmailNotification =
  (): UseDeleteEmailNotificationResult => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const deleteEmailNotification = useCallback(
      async (id: number): Promise<boolean> => {
        try {
          setIsLoading(true);
          setError(null);

          await emailNotificationsService.deleteEmailNotification(id);
          return true;
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err
              : new Error("Failed to delete email notification");
          setError(errorMessage);
          return false;
        } finally {
          setIsLoading(false);
        }
      },
      []
    );

    return { isLoading, error, deleteEmailNotification };
  };

// Hook for fetching email notifications by status
interface UseEmailNotificationsByStatusResult {
  data: EmailNotification[] | null;
  isLoading: boolean;
  error: Error | null;
  fetchByStatus: (status: "Active" | "Inactive") => Promise<void>;
}

export const useEmailNotificationsByStatus =
  (): UseEmailNotificationsByStatusResult => {
    const [data, setData] = useState<EmailNotification[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchByStatus = useCallback(async (status: "Active" | "Inactive") => {
      try {
        setIsLoading(true);
        setError(null);

        const response =
          await emailNotificationsService.getEmailNotificationsByStatus(status);
        setData(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error(
                `Failed to fetch ${status.toLowerCase()} email notifications`
              )
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

    return { data, isLoading, error, fetchByStatus };
  };
