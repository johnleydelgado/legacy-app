// import { Module } from '@nestjs/common';
// import { PassportModule } from '@nestjs/passport';
// import { JwtStrategy } from '../jwt/jwt.strategy';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
//
//
// @Module({
//   imports: [
//     PassportModule.register({ defaultStrategy: 'jwt' }),
//   ],
//   controllers: [AuthController],
//   providers: [JwtStrategy, AuthService],
//   exports: [PassportModule],
// })
//
// export class AuthModule {}

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CognitoModule } from '../cognito/cognito.module';
import { JwtStrategy } from './jwt.strategy';


@Module({
  // imports: [PassportModule, CognitoModule],
  imports: [PassportModule],
  providers: [JwtStrategy],
  exports: [],
})

export class AuthModule {}
