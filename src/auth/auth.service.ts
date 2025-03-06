import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { compareSync } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Token} from 'src/user/user.models';
import { Model } from 'mongoose';
import { IToken, IUser } from 'src/user/interface/user.interface';
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
        await this.tokenModule.findOneAndDelete({ userId: user.id });

        return await this.generateToken(user) 
    }

   
  

    async refreshTokens(refreshToken: string) {
    const tokenDoc = await this.tokenModule.findOne({ token: refreshToken });
    
    if (!tokenDoc ) {
        throw new UnauthorizedException('Invalid refresh token');
    }
        if (Date.now() > tokenDoc.exp.getTime()) {
        await this.tokenModule.deleteOne({ token: refreshToken});
        throw new UnauthorizedException;
    }
    
    const user = await this.userService.getUserById(tokenDoc.userId);
    if (!user) {
        throw new UnauthorizedException('User not found');
    }
    
    // Видалити старий токен
    await this.tokenModule.deleteMany({ userId: user._id });
    
    return await this.generateToken(user)  
    }
    

    async logout(refreshToken: string) {
        await this.tokenModule.deleteOne({ token: refreshToken });
    return { success: true };
    }
    

    private async refreshToken(userId: string) {
        const refreshToken = await this.tokenModule.create({
        token: v4(),
        exp: add(new Date(), { months: 1 }),
        userId,
         });
            return refreshToken
    }
    // Генерація токенів
    private async generateToken(user: IUser) {
    const accessToken = 'Bearer ' + this.jwtServise.sign({ id: user._id, email: user.email, role: user.role });
    const refreshToken = await this.refreshToken(user._id);
    return { accessToken, refreshToken };
}
}