import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  ListUsersCommand,
  ListUsersCommandInput,
  RespondToAuthChallengeCommand,
  RespondToAuthChallengeCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  CognitoJwtVerifier,
  CognitoJwtVerifierSingleUserPool,
} from "aws-jwt-verify/cognito-verifier";

export class CognitoClient {
  private readonly cognitoClient: CognitoIdentityProviderClient;
  private readonly accessTokenVerifier: CognitoJwtVerifierSingleUserPool<{
    userPoolId: string;
    tokenUse: "access";
    clientId: string;
  }>;

  private readonly cognitoUserPoolId = String(
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID
  );
  private readonly cognitoClientId = String(
    process.env.NEXT_PUBLIC_COGNITO_APPLICATION_CLIENT_ID,
  );
  private readonly cognitoClientSecret = String(
    process.env.NEXT_PUBLIC_COGNITO_APPLICATION_CLIENT_SECRET,
  );

  constructor() {
    // @ts-ignore
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: String(process.env.NEXT_PUBLIC_AMPLIFY_AWS_REGION),
      credentials: {
        accessKeyId: String(process.env.NEXT_PUBLIC_AMPLIFY_AWS_ACCESS_KEY),
        secretAccessKey: String(process.env.NEXT_PUBLIC_AMPLIFY_AWS_SECRET_ACCESS_KEY),
      },
    });

    this.accessTokenVerifier = CognitoJwtVerifier.create({
      userPoolId: this.cognitoUserPoolId,
      tokenUse: "access",
      clientId: this.cognitoClientId,
    });
  }

  private async generateSecretHash(username: string) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(this.cognitoClientSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(username + this.cognitoClientId),
    );
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  async getUsernames() {
    const params: ListUsersCommandInput = {
      UserPoolId: this.cognitoUserPoolId,
    };
    try {
      return await this.cognitoClient.send(new ListUsersCommand(params));
    } catch (error) {
      throw error;
    }
  }

  async authenticate(input: { username: string; password: string }) {
    const { username, password } = input;

    const secretHash = await this.generateSecretHash(username);

    const params: InitiateAuthCommandInput = {
      ClientId: this.cognitoClientId,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    };

    try {
      return await this.cognitoClient.send(new InitiateAuthCommand(params));
    } catch (error) {
      throw error;
    }
  }

  async setNewPassword(input: {
    username: string;
    newPassword: string;
    session: string;
  }) {
    const { username, newPassword, session } = input;

    const secretHash = await this.generateSecretHash(username);

    const params: RespondToAuthChallengeCommandInput = {
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ClientId: this.cognitoClientId,
      Session: session,
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: newPassword,
        SECRET_HASH: secretHash,
      },
    };

    try {
      return await this.cognitoClient.send(
        new RespondToAuthChallengeCommand(params),
      );
    } catch (error) {
      throw error;
    }
  }

  async verifyAccessToken(accessToken: string) {
    try {
      const user = await this.accessTokenVerifier.verify(accessToken);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(input: { refreshToken: string; username: string }) {
    const { refreshToken, username } = input;

    const secretHash = await this.generateSecretHash(username);

    const params: InitiateAuthCommandInput = {
      ClientId: this.cognitoClientId,
      AuthFlow: "REFRESH_TOKEN_AUTH",
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
        SECRET_HASH: secretHash,
      },
    };

    try {
      return await this.cognitoClient.send(new InitiateAuthCommand(params));
    } catch (error) {
      throw error;
    }
  }
}
