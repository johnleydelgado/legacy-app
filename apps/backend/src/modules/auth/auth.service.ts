import { Injectable } from '@nestjs/common';
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';

import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';

import * as crypto from 'crypto';
import * as base64 from 'base-64';

const computeSecretHash = async (username: string, clientId: string, clientSecret: string): Promise<string> => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(clientSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(username + clientId),
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)));

  // const message = username + clientId;
  // const hmac = crypto.createHmac('sha256', clientSecret);
  // hmac.update(message);
  // return base64.encode(hmac.digest().toString("base64"));
};

interface authResultsResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}


@Injectable()
export class AuthService {
  private cognitoClient: CognitoIdentityProviderClient;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION,
    });
  }

  async login(username: string, password: string): Promise<string> {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: await computeSecretHash(
          username,
          process.env.AWS_COGNITO_CLIENT_ID || "",
          process.env.AWS_COGNITO_CLIENT_SECRET || ""
        ),
      },
    });

    try {
      const response = await this.cognitoClient.send(command);

      const authResult = response.AuthenticationResult;

      // console.log("authResult:", authResult);

      return response.AuthenticationResult?.AccessToken || '';
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
}
