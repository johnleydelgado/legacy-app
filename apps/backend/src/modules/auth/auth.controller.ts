import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { authURL, loginURL } from './auth.constants';

@ApiTags('auth')
@Controller({ version: '1', path: authURL })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(loginURL)
  async login(@Body() body: { username: string; password: string }) {
    // return await this.authService.login(body.username, body.password);
    const accessToken = await this.authService.login(body.username, body.password);
    return { accessToken };
  }
}
