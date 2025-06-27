import { AuthService } from './auth.service';
import { Request } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    logger(): void;
    signupUser(body: any, res: Response): Promise<any>;
    signinUser(body: any, res: Response): Promise<any>;
    getFriends(req: Request, res: Response): Promise<{
        data: import("mongodb").WithId<import("bson").Document>;
        success: boolean;
    }>;
    showChat(chatId: string, req: Request): Promise<{
        chatName: Promise<any>;
        chats: import("mongodb").WithId<import("bson").Document>[];
    }>;
    stroreChat(data: any, req: Request): Promise<string>;
}
