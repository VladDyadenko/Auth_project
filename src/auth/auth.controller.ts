import { Body, Controller, Get, Post } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto';

@Controller('auth')
export class AuthController {

    @Post('register')
    async register(@Body() dto:RegisterDto) { }
    
    @Post('login')
    async login(@Body() dto:LoginDto) { }

    @Get('refresh')
    async refresh() { }
}