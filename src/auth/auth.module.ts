import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { options } from './config';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenSchema } from 'src/user/user.models';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [PassportModule, JwtModule.registerAsync(options()), UserModule,
    MongooseModule.forFeature([{ name: 'Token', schema: TokenSchema }]),],
 
})
export class AuthModule {}
