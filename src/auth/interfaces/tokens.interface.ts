import { IToken } from "src/user/interface/user.interface";

export interface Tokens {
    accessToken: string;
    refreshToken: IToken; 
}
