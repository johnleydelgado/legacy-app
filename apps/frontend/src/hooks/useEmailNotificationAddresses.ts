import { useState, useEffect } from "react";
import {
  getActiveEmailNotificationAddresses,
  getAllEmailNotificationAddresses,
} from "@/utils/email-notifications";

/**
 * Hook to get active email notification addresses
 * @returns Object with addresses, loading state, and error
 */
export const useActiveEmailNotificationAddresses = () => {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const activeAddresses = await getActiveEmailNotificationAddresses();
        setAddresses(activeAddresses);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch email addresses")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const activeAddresses = await getActiveEmailNotificationAddresses();
      setAddresses(activeAddresses);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch email addresses")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { addresses, isLoading, error, refetch };
};

/**
 * Hook to get all email notification addresses (active and inactive)
 * @returns Object with addresses, loading state, and error
 */
export const useAllEmailNotificationAddresses = () => {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const allAddresses = await getAllEmailNotificationAddresses();
        setAddresses(allAddresses);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch email addresses")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allAddresses = await getAllEmailNotificationAddresses();
      setAddresses(allAddresses);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch email addresses")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { addresses, isLoading, error, refetch };
};
