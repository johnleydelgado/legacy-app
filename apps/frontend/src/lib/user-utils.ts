import { DecodedIdToken } from "@/types";
// import { User } from "@prisma/client";

export const isDecodedIdTokenAdmin = (user: DecodedIdToken) => {
  return user?.["cognito:groups"]?.includes("admin") ?? false;
};

// export const isUserAdmin = (user: User) => {
//   return user.role === "ADMIN";
// };

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
};

export const getFullName = (firstName?: string, lastName?: string) => {
  const fName = firstName ?? "";
  const lName = lastName ?? "";
  return `${fName} ${lName}`;
};


export function formatMetric(n: number) {
  return Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short", // 1.2M instead of 1.2 million
    maximumFractionDigits: 1,
  }).format(n);
}