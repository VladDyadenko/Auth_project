import { BadRequestException, Body, Controller, Get, Post, UnauthorizedException, Res, HttpStatus, Req } from '@nestjs/common';
import { Response } from 'express';
import { LoginDto, RegisterDto } from './dto';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Tokens } from './interfaces/tokens.interface';
import { Cookies, UserAgent } from '@common/decorators';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService,
                private readonly configService: ConfigService,
) { }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        const user = await this.authService.register(dto);
        if (!user) {
            throw new BadRequestException(`Помилка при реєстрації користувача з даними ${JSON.stringify(dto)}`);
        }
        return user;
    }
    
    @Post('login')
    async login(@Body() dto: LoginDto, @Res() res: Response, @UserAgent() agent:string) {
        const tokens = await this.authService.login(dto, agent);
        this.setRefreshTokenCookie(tokens, res);
    }

    
    private setRefreshTokenCookie(tokens: Tokens, @Res() res: Response) {
        if (!tokens || !tokens.refreshToken) {
            throw new UnauthorizedException('Invalid tokens');
        }
        res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken.token, {
            httpOnly: true,
            expires: new Date(tokens.refreshToken.exp),
            sameSite: 'lax',
            secure: this.configService.get('NODE_ENV', 'development') === 'production',
            path:'/',
        })
        res.status(HttpStatus.CREATED).json({accessToken:tokens.accessToken})
    }

    @Get('refresh_tokens')
    async refreshTokens(@Cookies(REFRESH_TOKEN_COOKIE_NAME) refreshToken: string, @Res() res: Response, @UserAgent() agent:string) {
        if (!refreshToken) {
            throw new UnauthorizedException;
        }
        const tokens = await this.authService.refreshTokens(refreshToken, agent);
        this.setRefreshTokenCookie(tokens, res);
    }
}