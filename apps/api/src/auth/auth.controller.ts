import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthContext } from '@beannie/auth-types';
import type { CookieOptions, Request, Response } from 'express';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  getLogin(): { authorizationUrl: string } {
    return { authorizationUrl: this.authService.getAuthorizationUrl() };
  }

  @Get('callback')
  async getCallback(@Query('code') code: string | undefined, @Res() res: Response) {
    if (!code) {
      throw new BadRequestException('Missing auth code');
    }

    const { sealedSession } = await this.authService.authenticateWithCode(code);

    res.cookie(
      this.authService.getSessionCookieName(),
      sealedSession,
      this.getCookieOptions(),
    );

    return res.redirect(this.authService.getAppUrl());
  }

  @Get('me')
  async getMe(@Req() req: Request): Promise<AuthContext> {
    const session = this.authService.loadSession(
      req.cookies?.[this.authService.getSessionCookieName()],
    );

    if (!session) {
      throw new UnauthorizedException('No session');
    }

    const { authenticated, user } = await session.authenticate();

    if (!authenticated || !user) {
      throw new UnauthorizedException('Not authenticated');
    }

    return {
      isAuthenticated: true,
      user: this.authService.toAuthUser(user),
    };
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie(this.authService.getSessionCookieName(), this.getCookieOptions());
  }

  private getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.authService.isProduction(),
      sameSite: 'lax',
      path: '/',
    };
  }
}
