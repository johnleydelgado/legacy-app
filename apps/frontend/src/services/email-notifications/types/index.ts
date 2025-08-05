export interface EmailNotification {
  pk_email_notification_id: number;
  email_address: string;
  status: "Active" | "Inactive";
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailNotificationDto {
  email_address: string;
  status?: "Active" | "Inactive";
  description?: string;
}

export interface UpdateEmailNotificationDto {
  email_address?: string;
  status?: "Active" | "Inactive";
  description?: string;
}

export interface EmailNotificationsQueryParams {
  page?: number;
  limit?: number;
  status?: "Active" | "Inactive";
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface EmailNotificationsResponse {
  items: EmailNotification[];
  meta: PaginationMeta;
}

export interface EmailNotificationResponse {
  data: EmailNotification;
  message: string;
}

export interface EmailNotificationsByStatusResponse {
  data: EmailNotification[];
  message: string;
}
