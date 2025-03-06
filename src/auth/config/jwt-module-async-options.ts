import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';

const jwtModuleOptions = (config: ConfigService): JwtModuleOptions => ({
  secret: config.get<string>('JWT_SECRET') || 'default_secret', // Додаємо дефолтне значення
  signOptions: { expiresIn: config.get<string>('JWT_EXP') || '5m' },
});

export const options = (): JwtModuleAsyncOptions => ({
  inject: [ConfigService], // Додаємо ConfigService
  useFactory: (config: ConfigService) => jwtModuleOptions(config),
});
