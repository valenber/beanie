import { InternalServerErrorException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WorkOS } from '@workos-inc/node';
import type { User as AuthUser } from '@beannie/auth-types';

import { SESSION_COOKIE_NAME } from './auth.constants';

interface AuthConfig {
  apiKey: string;
  clientId: string;
  cookiePassword: string;
  redirectUri: string;
  appUrl: string;
}

interface WorkOSUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthSession {
  authenticate(): Promise<{ authenticated: boolean; user?: WorkOSUser }>;
}

@Injectable()
export class AuthService {
  private config?: AuthConfig;
  private workos?: WorkOS;

  constructor(private readonly configService: ConfigService) {}

  getAuthorizationUrl(): string {
    const config = this.getConfig();
    const workos = this.getWorkos(config);

    return workos.userManagement.getAuthorizationUrl({
      provider: 'authkit',
      redirectUri: config.redirectUri,
      clientId: config.clientId,
    });
  }

  async authenticateWithCode(
    code: string,
  ): Promise<{ user: AuthUser; sealedSession: string }> {
    const config = this.getConfig();
    const workos = this.getWorkos(config);

    const response = await workos.userManagement.authenticateWithCode({
      code,
      clientId: config.clientId,
      session: {
        sealSession: true,
        cookiePassword: config.cookiePassword,
      },
    });

    const user = this.toAuthUser(response.user as WorkOSUser);

    if (!response.sealedSession) {
      throw new InternalServerErrorException('WorkOS did not return a session.');
    }

    return { user, sealedSession: response.sealedSession };
  }

  loadSession(sessionData: string | undefined): AuthSession | null {
    if (!sessionData) {
      return null;
    }

    const config = this.getConfig();
    const workos = this.getWorkos(config);

    return workos.userManagement.loadSealedSession({
      sessionData,
      cookiePassword: config.cookiePassword,
    }) as AuthSession;
  }

  getAppUrl(): string {
    return this.getConfig().appUrl;
  }

  isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  getSessionCookieName(): string {
    return SESSION_COOKIE_NAME;
  }

  toAuthUser(user: WorkOSUser): AuthUser {
    const nameParts = [user.firstName, user.lastName].filter(Boolean);
    const name = nameParts.length > 0 ? nameParts.join(' ') : user.email;

    return {
      id: user.id,
      email: user.email,
      name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private getConfig(): AuthConfig {
    if (this.config) {
      return this.config;
    }

    const apiKey = this.configService.get<string>('WORKOS_API_KEY')!;
    const clientId = this.configService.get<string>('WORKOS_CLIENT_ID')!;
    const cookiePassword = this.configService.get<string>('WORKOS_COOKIE_PASSWORD')!;
    const redirectUri = this.configService.get<string>('WORKOS_REDIRECT_URI')!;
    const appUrl = this.configService.get<string>('APP_URL')!;

    this.config = {
      apiKey,
      clientId,
      cookiePassword,
      redirectUri,
      appUrl,
    };

    return this.config;
  }

  private getWorkos(config: AuthConfig): WorkOS {
    if (!this.workos) {
      this.workos = new WorkOS(config.apiKey, { clientId: config.clientId });
    }

    return this.workos;
  }
}
