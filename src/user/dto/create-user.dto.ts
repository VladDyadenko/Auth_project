import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto{
             @IsString()
    readonly name: string;
             @IsEmail()
    readonly email: string;
             @IsString()
             @MinLength(6)
    readonly password: string;
             @IsString()
    readonly role?: string;
 
}