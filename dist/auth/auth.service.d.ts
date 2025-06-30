import { DatabaseService } from "src/database/database.service";
import { Chat, UserInfo } from "src/types";
export declare class AuthService {
    private readonly dbService;
    constructor(dbService: DatabaseService);
    userInfo: UserInfo;
    sessions: object;
    getUsername(sessionId: string): any;
    getDb(dbName: any): import("mongodb").Collection<import("bson").Document>;
    isNameValid(username: string, usersCollection: any): Promise<boolean>;
    createSession: (username: string, res: any) => void;
    signupUser(username: string, password: string, res: any): Promise<any>;
    signinUser(username: string, password: string, res: any): Promise<any>;
    chatList(username: string): Promise<import("mongodb").WithId<import("bson").Document>>;
    getFriendName(frndName: string, sessionId: string): Promise<any[]>;
    showChat(frndName: string, sessionId: string): Promise<{
        chatName: any;
        chats: import("mongodb").WithId<import("bson").Document>[];
    }>;
    getChatId(from: any, username: any): Promise<any>;
    storeChatInDb(chat: Chat): Promise<string>;
    storeChat({ from, to, msg }: {
        from: any;
        to: any;
        msg: any;
    }, username: any): Promise<string>;
}
