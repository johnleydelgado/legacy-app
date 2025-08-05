import { emailNotificationsService } from "@/services/email-notifications";
import { getFallbackTeamEmailAddresses } from "@/constants/teamEmails";

/**
 * Get active email notification addresses for team notifications
 * @returns Promise<string[]> Array of active email addresses
 */
export const getActiveEmailNotificationAddresses = async (): Promise<
  string[]
> => {
  try {
    const response =
      await emailNotificationsService.getEmailNotificationsByStatus("Active");
    const addresses = response.data.map((email) => email.email_address);

    // If no active emails found, use fallback
    if (addresses.length === 0) {
      console.warn(
        "No active email notifications found, using fallback addresses"
      );
      //   return getFallbackTeamEmailAddresses();
    }

    return addresses;
  } catch (error) {
    console.error("Failed to fetch active email notifications:", error);
    // Fallback to hardcoded addresses if API fails
    return getFallbackTeamEmailAddresses();
  }
};

/**
 * Get all email notification addresses (both active and inactive)
 * @returns Promise<string[]> Array of all email addresses
 */
export const getAllEmailNotificationAddresses = async (): Promise<string[]> => {
  try {
    const response = await emailNotificationsService.getEmailNotifications();
    return response.items.map((email) => email.email_address);
  } catch (error) {
    console.error("Failed to fetch email notifications:", error);
    // Fallback to empty array if API fails
    return [];
  }
};
