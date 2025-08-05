"use server";

import { decode } from "jsonwebtoken";
import { cookies } from "next/headers";

import { CognitoClient } from "@/lib/cognito-client";
import { DecodedIdToken } from "@/types";

import { PAGE_DASHBOARD_URL, PAGE_LOGIN_URL } from "../constants/pageUrls_old";
import { Role } from "@/utils/acl";
import {getErrorMessage} from "../utils/get-error-message";
import { getFullName, isDecodedIdTokenAdmin } from "./user-utils";

export const handleSignIn = async (
  state:
    | {
      redirectUrl?: string;
      username?: string;
      password?: string;
      error?: string;
    }
    | undefined,
  formData: FormData,
) => {
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));

  try {
    const data = await new CognitoClient().authenticate({
      username,
      password,
    });

    if (data.ChallengeName === "NEW_PASSWORD_REQUIRED") {
      return {
        redirectUrl: `/set-new-password?session=${data.Session}&username=${username}`,
        username,
        password,
      };
    }

    if (data.AuthenticationResult && data.AuthenticationResult.IdToken) {
      const { AccessToken, IdToken, RefreshToken } = data.AuthenticationResult;

      // const dbClient = new DbClient();
      const decodedIdToken = decode(IdToken) as DecodedIdToken;

      const profileData = {
        cognitoId: decodedIdToken.sub,
        username: decodedIdToken["cognito:username"],
        email: decodedIdToken.email,
        firstname: decodedIdToken.given_name,
        lastname: decodedIdToken.family_name,
        fullname: getFullName(decodedIdToken.given_name, decodedIdToken.family_name),
        role: isDecodedIdTokenAdmin(decodedIdToken) ? "ADMIN" : "EMPLOYEE",
      };

      // const userData: UserDraft = {
      //   cognitoId: decodedIdToken.sub,
      //   username: decodedIdToken["cognito:username"],
      //   email: decodedIdToken.email,
      //   firstName: decodedIdToken.given_name,
      //   lastName: decodedIdToken.family_name,
      //   fullName: getFullName(
      //     decodedIdToken.given_name,
      //     decodedIdToken.family_name,
      //   ),
      //   initials: getInitials(
      //     getFullName(decodedIdToken.given_name, decodedIdToken.family_name),
      //   ),
      //   role: isDecodedIdTokenAdmin(decodedIdToken) ? "ADMIN" : "EMPLOYEE",
      // };

      //   await dbClient.upsertUser(userData);
      const cookieStore = await cookies();
      if (AccessToken) {
        // @ts-ignore
        cookieStore.set({
          name: "token",
          value: AccessToken,
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 3600, // 1 hour
          path: "/",
        });
      }

      if (RefreshToken) {
        // @ts-ignore
        cookieStore.set({
          name: "refreshToken",
          value: RefreshToken,
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 2592000, // 30 days
          path: "/",
        });
      }

      if (IdToken) {
        // @ts-ignore
        cookieStore.set({
          name: "idToken",
          value: IdToken,
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 3600, // 1 hour
          path: "/",
        });
      }

      if (profileData) {
        // @ts-ignore
        cookieStore.set({
          name: "profileData",
          value: JSON.stringify(profileData),
        });
      }

      return {
        redirectUrl: PAGE_DASHBOARD_URL,
        username,
        password,
      };
    }
    // endregion

    return;
  } catch (error) {

    console.log(error);
    console.log(getErrorMessage(error));
    return { error: getErrorMessage(error) };
  }
};

export const handleNewPassword = async (
  state: { redirectUrl: string; password: string } | undefined,
  formData: FormData,
) => {
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));
  const session = String(formData.get("session"));

  try {
    await new CognitoClient().setNewPassword({
      username,
      newPassword: password,
      session,
    });

    return {
      redirectUrl: "/",
      password,
    };
  } catch (error) {
    console.log(error);
    console.log(getErrorMessage(error));
  }
};

export const handleSignOut = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    cookieStore.delete("idToken");
    cookieStore.delete("refreshToken");

    // const device = cookieStore.get("device")?.value;

    // if (device === Device.KIOSK) {
    //   return {
    //     redirectUrl: "/kiosk/login",
    //   };
    // }

    return {
      redirectUrl: PAGE_LOGIN_URL,
    };

  } catch (error) {
    console.log(getErrorMessage(error));
  }
};

export const handleRefreshToken = async (refreshToken: string, username: string) => {
  try {
    const cognitoClient = new CognitoClient();
    const response = await cognitoClient.refreshToken({ refreshToken, username });

    if (response.AuthenticationResult) {
      const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;
      const cookieStore = await cookies();

      // Update cookies with new tokens
      if (AccessToken) {
        cookieStore.set({
          name: "token",
          value: AccessToken,
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 3600,
          path: "/",
        });
      }

      if (IdToken) {
        cookieStore.set({
          name: "idToken",
          value: IdToken,
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 3600,
          path: "/",
        });
      }

      // Update refresh token if a new one is provided
      if (RefreshToken) {
        cookieStore.set({
          name: "refreshToken",
          value: RefreshToken,
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 2592000, // 30 days
          path: "/",
        });
      }

      return { success: true, tokens: { AccessToken, IdToken, RefreshToken } };
    }

    return { success: false, error: "No authentication result" };
  } catch (error) {
    console.error("Token refresh failed:", error);
    return { success: false, error: getErrorMessage(error) };
  }
};

