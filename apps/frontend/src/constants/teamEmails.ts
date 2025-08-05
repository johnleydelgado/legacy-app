export interface TeamMember {
  email: string;
  name: string;
}

export const TEAM_EMAILS: TeamMember[] = [
  { email: "johnleydelgado@entvas.com", name: "john" },
  { email: "Alerts@legacyknitting.com", name: "alerts" },
  { email: "adam@legacyknitting.com", name: "adam" },
];

// Helper function to extract just the email addresses
export const getTeamEmailAddresses = (): string[] => {
  return TEAM_EMAILS.map((member) => member.email);
};

// Fallback function for when API fails
export const getFallbackTeamEmailAddresses = (): string[] => {
  return TEAM_EMAILS.map((member) => member.email);
};

// Helper function to get a display name for notifications
export const getTeamDisplayName = (): string => {
  return "Legacy Knitting Team";
};
