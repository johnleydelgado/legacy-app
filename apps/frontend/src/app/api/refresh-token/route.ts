import { NextRequest, NextResponse } from "next/server";
import { CognitoClient } from "@/lib/cognito-client";
import { decode } from "jsonwebtoken";
import { DecodedIdToken } from "@/types";
import { getFullName, isDecodedIdTokenAdmin } from "@/lib/user-utils";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken, username } = await request.json();

    if (!refreshToken || !username) {
      return NextResponse.json(
        { success: false, error: "Missing refresh token or username" },
        { status: 400 }
      );
    }

    const cognitoClient = new CognitoClient();
    const response = await cognitoClient.refreshToken({ refreshToken, username });

    if (response.AuthenticationResult) {
      const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;

      // Update profile data if we have a new ID token
      let profileData;
      if (IdToken) {
        const decodedIdToken = decode(IdToken) as DecodedIdToken;
        profileData = {
          cognitoId: decodedIdToken.sub,
          username: decodedIdToken["cognito:username"],
          email: decodedIdToken.email,
          firstname: decodedIdToken.given_name,
          lastname: decodedIdToken.family_name,
          fullname: getFullName(decodedIdToken.given_name, decodedIdToken.family_name),
          role: isDecodedIdTokenAdmin(decodedIdToken) ? "ADMIN" : "EMPLOYEE",
        };
      }

      return NextResponse.json({
        success: true,
        tokens: { AccessToken, IdToken, RefreshToken },
        profileData,
      });
    }

    return NextResponse.json(
      { success: false, error: "No authentication result" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Token refresh failed:", error);
    return NextResponse.json(
      { success: false, error: "Token refresh failed" },
      { status: 500 }
    );
  }
} 