// import { TimeLog, User } from "@prisma/client";

export type DecodedIdToken = {
  sub: string;
  "cognito:groups": string[];
  "cognito:username": string;
  email: string;
  given_name: string;
  family_name: string;
};

// Product Price types
export * from "./product-prices";

// export type UserDraft = Omit<User, "id" | "createdAt" | "updatedAt">;

// export type TimeLogDraft = Omit<
//     TimeLog,
//     "id" | "createdAt" | "updatedAt" | "isConfirmed" | "clockOut" | "duration"
//     >;
