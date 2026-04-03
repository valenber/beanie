import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['../../.env'],
      validationSchema: Joi.object({
        WORKOS_API_KEY: Joi.string().required(),
        WORKOS_CLIENT_ID: Joi.string().required(),
        WORKOS_COOKIE_PASSWORD: Joi.string().required(),
        WORKOS_REDIRECT_URI: Joi.string()
          .uri({ scheme: ['http', 'https'] })
          .required(),
        APP_URL: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
        PORT: Joi.number().port().required(),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
      }),
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
