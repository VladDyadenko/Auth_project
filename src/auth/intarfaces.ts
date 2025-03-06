import { Token } from "src/user/user.models";

export interface Tokens{
    accessToken: string;
    refreshToken: Token;
}