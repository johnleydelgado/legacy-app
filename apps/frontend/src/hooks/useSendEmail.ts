import { useMutation } from "@tanstack/react-query";
import {
  sendEmail,
  SendEmailDto,
  SendEmailResponse,
} from "@/services/email/email.service";

interface UseSendEmailResult {
  sendEmail: (data: SendEmailDto) => Promise<SendEmailResponse>;
  loading: boolean;
  error: Error | null;
  data: SendEmailResponse | undefined;
}

/**
 * React hook for sending emails.
 *
 * @returns {UseSendEmailResult}
 *
 * @example
 * const { sendEmail, loading, error } = useSendEmail();
 *
 * const onSubmit = async () => {
 *   await sendGreeting({ to: "user@example.com", name: "John" });
 * };
 */
export const useSendEmail = (): UseSendEmailResult => {
  const mutation = useMutation<SendEmailResponse, Error, SendEmailDto>({
    mutationFn: sendEmail,
  });

  return {
    sendEmail: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error ?? null,
    data: mutation.data,
  };
};
