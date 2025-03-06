import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { compareSync } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from 'src/user/user.models';
import { Model } from 'mongoose';
import { IToken } from 'src/user/interface/user.interface';
import { add } from 'date-fns';
import { v4 } from 'uuid';


@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(private readonly userService: UserService, 
        private readonly jwtServise: JwtService,
         @InjectModel(Token.name) private tokenModule: Model<IToken>,
    ) { }
        
    async register(dto: RegisterDto) {
    const existingUser = await this.userService.getUserByEmail(dto.email);
    if (existingUser) {
        throw new BadRequestException('Такий користувач вже існує');
    }
       try {
     return await this.userService.createUser(dto);
    } catch (error) {
    this.logger.error(error);
    throw new BadRequestException('Помилка при реєстрації');
    }
}

    async login(dto:LoginDto) {
        const user = await this.userService.getUserByEmail(dto.email);
        
        if (!user || !compareSync(dto.password, user.password)) {
            throw new UnauthorizedException('Invalid email or password');
            
        }

        const accessToken = this.jwtServise.sign({ id: user.id, email: user.email, roles: user.roles });
        
        const refreshToken = await this.refreshToken(user.id);
          return { accessToken, refreshToken};
    }
        private async refreshToken(userId: string) {
        const tokenValue = v4();
        await this.tokenModule.create({
        token: tokenValue,
        exp: add(new Date(), { months: 1 }),
        userId,
     });
        return tokenValue; 
    }


    async refresh(refreshToken: string) {
    const tokenDoc = await this.tokenModule.findOne({ token: refreshToken });
    
    if (!tokenDoc || new Date() > tokenDoc.exp) {
        throw new UnauthorizedException('Invalid or expired refresh token');
    }
    
    const user = await this.userService.getUserById(tokenDoc.userId);
    if (!user) {
        throw new UnauthorizedException('User not found');
    }
    
    // Видалити старий токен
    await this.tokenModule.deleteOne({ token: refreshToken });
    
    // Створити нові токени
    const accessToken = this.jwtServise.sign({ id: user.id, email: user.email, roles: user.roles });
    const newRefreshToken = await this.refreshToken(user.id);
    
    return { accessToken, refreshToken: newRefreshToken };

    
}
    
    async logout(refreshToken: string) {
    await this.tokenModule.deleteOne({ token: refreshToken });
    return { success: true };
}
}