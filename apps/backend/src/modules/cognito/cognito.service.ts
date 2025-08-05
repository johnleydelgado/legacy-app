// import { Injectable } from '@nestjs/common';
// import {
//   CognitoIdentityProviderClient,
//   InitiateAuthCommand,
//   RespondToAuthChallengeCommand
// } from '@aws-sdk/client-cognito-identity-provider';
// import crypto from 'crypto';
//
// const computeSecretHash = async (username: string, clientId: string, clientSecret: string): Promise<string> => {
//   const encoder = new TextEncoder();
//   const key = await crypto.subtle.importKey(
//     "raw",
//     encoder.encode(clientSecret),
//     { name: "HMAC", hash: "SHA-256" },
//     false,
//     ["sign"],
//   );
//   const signature = await crypto.subtle.sign(
//     "HMAC",
//     key,
//     encoder.encode(username + clientId),
//   );
//   return btoa(String.fromCharCode(...new Uint8Array(signature)));
//
//   // const message = username + clientId;
//   // const hmac = crypto.createHmac('sha256', clientSecret);
//   // hmac.update(message);
//   // return base64.encode(hmac.digest().toString("base64"));
// };
//
//
// @Injectable()
// export class CognitoService {
//   private cognitoClient: CognitoIdentityProviderClient;
//
//   constructor() {
//     this.cognitoClient = new CognitoIdentityProviderClient({
//       region: process.env.AWS_REGION
//     });
//   }
//
//   async signIn(username: string, password: string): Promise<any> {
//     const authParams = {
//       AuthFlow: 'USER_PASSWORD_AUTH',
//       // ClientId: 'YOUR_COGNITO_CLIENT_ID',
//       ClientId: process.env.AWS_COGNITO_CLIENT_ID,
//       AuthParameters: {
//         USERNAME: username,
//         PASSWORD: password,
//         SECRET_HASH: await computeSecretHash(
//           username,
//           process.env.AWS_COGNITO_CLIENT_ID || "",
//           process.env.AWS_COGNITO_CLIENT_SECRET || ""
//         ),
//       },
//     };
//
//     const authCommand = new InitiateAuthCommand(authParams);
//
//     try {
//       const authResponse = await this.cognitoClient.send(authCommand);
//
//       // if (authResponse.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
//       //   const challengeResponse = await this.respondToNewPasswordChallenge(
//       //     authResponse.Session,
//       //     username,
//       //     password,
//       //   );
//       //   return challengeResponse.AuthenticationResult;
//       // }
//
//       return authResponse.AuthenticationResult;
//
//     } catch (error) {
//       throw new Error(`Cognito sign-in error: ${error.message}`);
//     }
//   }
//
//   // private async respondToNewPasswordChallenge(
//   //   session: string,
//   //   username: string,
//   //   newPassword: string,
//   // ): Promise<any> {
//   //   const challengeParams = {
//   //     ChallengeName: 'NEW_PASSWORD_REQUIRED',
//   //     // ClientId: 'YOUR_COGNITO_CLIENT_ID',
//   //     ClientId: process.env.AWS_COGNITO_CLIENT_ID,
//   //     Session: session,
//   //     ChallengeResponses: {
//   //       USERNAME: username,
//   //       NEW_PASSWORD: newPassword,
//   //     },
//   //   };
//   //   const challengeCommand = new RespondToAuthChallengeCommand(challengeParams);
//   //   return this.cognitoClient.send(challengeCommand);
//   // }
// }
