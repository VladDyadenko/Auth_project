
import { IsPasswordsMatchingConstraint } from "@common/decorators";
import { IsEmail, IsString, MinLength, Validate } from "class-validator";

export class RegisterDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
    
    @IsString()
    @MinLength(6)
    @Validate(IsPasswordsMatchingConstraint)
    passwordRepeat: string;
    
}