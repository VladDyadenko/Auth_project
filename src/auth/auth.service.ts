import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { compareSync } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Token} from 'src/user/user.models';
import { Model, Types } from 'mongoose';
import { IToken, IUser } from 'src/user/interface/user.interface';
import { add } from 'date-fns';
import { v4 } from 'uuid';
import { Tokens } from './interfaces/tokens.interface';


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

    async login(dto:LoginDto, agent: string) {
        const user = await this.userService.getUserByEmail(dto.email);
        
        if (!user || !compareSync(dto.password, user.password)) {
            throw new UnauthorizedException('Invalid email or password');
        }
        return await this.generateToken(user, agent) 
    }

    async refreshTokens(refreshToken: string, agent: string) {
        const tokenDoc = await this.tokenModule.findOne({ token: refreshToken });
        
        if (!tokenDoc) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        
        if (Date.now() > tokenDoc.exp.getTime()) {
            await this.tokenModule.deleteOne({ token: refreshToken });
            throw new UnauthorizedException('Token expired');
        }
        
        let userId: Types.ObjectId;
        try {
            userId = tokenDoc.userId instanceof Types.ObjectId
                ? tokenDoc.userId
                : Types.ObjectId.createFromHexString(String(tokenDoc.userId));
        } catch (error) {
            throw new UnauthorizedException('Invalid user ID format');
        }
        
        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        
        return await this.generateToken(user, agent);
    }

    async logout(refreshToken: string) {
        await this.tokenModule.deleteOne({ token: refreshToken });
    return { success: true };
    }
    

    private async refreshToken(_id: Types.ObjectId | string, agent: string) {
    const userId = typeof _id === 'string' 
        ? Types.ObjectId.createFromHexString(_id)
        : _id;
    
    try {
        let token = await this.tokenModule.findOne({
            userId: userId,
            userAgent: agent
        });

        const tokenData = {
            token: v4(),
            exp: add(new Date(), { months: 1 }),
            userId: userId,
            userAgent: agent
        };

        if (token) {
            token = await this.tokenModule.findOneAndUpdate(
                { 
                    userId: userId,
                    userAgent: agent 
                },
                tokenData,
                { new: true }
            );
        } else {
            token = await this.tokenModule.create(tokenData);
        }

        return token;
    } catch (error) {
        throw error;
    }
}

    // Генерація токенів
    private async generateToken(user: IUser, agent: string): Promise<Tokens> {
    const accessToken = 'Bearer ' + this.jwtServise.sign({ id: user._id, email: user.email, role: user.role });
    const refreshToken = await this.refreshToken(user._id, agent);
    
    if (!refreshToken) {
        throw new UnauthorizedException('Failed to generate refresh token');
    }
    
    return { 
        accessToken, 
        refreshToken: refreshToken 
    };
}
}