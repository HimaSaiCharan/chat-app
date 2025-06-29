"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let AuthService = class AuthService {
    dbService;
    constructor(dbService) {
        this.dbService = dbService;
    }
    userInfo = {
        username: "",
        password: "",
        chats: [],
    };
    sessions = { "123": "Malli" };
    getUsername(sessionId) {
        return this.sessions[sessionId];
    }
    getDb(dbName) {
        const db = this.dbService.getDb();
        return db.collection(dbName);
    }
    async isNameValid(username, usersCollection) {
        const values = await usersCollection.find({ username: username }).toArray();
        if (values.length > 0) {
            return false;
        }
        return true;
    }
    createSession = (username, res) => {
        const cookie = Math.random().toString(36).substring(2);
        res.cookie("sessionId", cookie);
        this.sessions[cookie] = username;
    };
    async signupUser(username, password, res) {
        const db = this.dbService.getDb();
        const usersCollection = this.getDb("users");
        const chatCollection = this.getDb("conversations");
        const value = await this.isNameValid(username, usersCollection);
        if (!value) {
            return res.json({
                isAccountCreated: false,
                message: `${username} is already used`,
                url: null,
            });
        }
        this.userInfo = {
            username,
            password,
            chats: [
                {
                    name: "bhagya",
                    lastMessage: "Hey what's up ?",
                    chatId: "1",
                },
                {
                    name: "abc",
                    lastMessage: "Hey there !",
                    chatId: "2",
                },
                {
                    name: "Guy 1",
                    lastMessage: "Hi",
                    chatId: "3",
                },
            ],
        };
        await usersCollection.insertOne(this.userInfo);
        await chatCollection.insertOne({
            from: "bhagya",
            to: "malli",
            msg: "hello",
            chatId: 1,
        });
        return res.json({
            isAccountCreated: true,
            message: "Account created successfully",
            url: "../signIn.html",
        });
    }
    async signinUser(username, password, res) {
        const usersCollection = this.getDb("users");
        const users = usersCollection.find();
        for await (const user of users) {
            if (user.username === username || user.password === password) {
                this.createSession(username, res);
                return res.json({ isExist: true, url: "../index.html" });
            }
        }
        return res.json({ isExist: false });
    }
    async chatList(username) {
        const usersCollection = this.getDb("users");
        const user = usersCollection.find({ username }, { projection: { username: 1, chats: 1 } });
        const chatList = (await user.toArray())[0];
        return chatList;
    }
    async getFriendName(chatId, sessionId) {
        const usersCollection = this.getDb("users");
        const username = this.sessions[sessionId];
        const chats = await usersCollection
            .find({ username: username }, { projection: { chats: 1 } })
            .toArray();
        const index = chats[0].chats.findIndex((chat) => chat.chatId === chatId);
        return chats[0].chats[index].name;
    }
    async showChat(chatId, sessionId) {
        const friendName = this.getFriendName(chatId, sessionId);
        const chatCollection = this.getDb("conversations");
        const chats = await chatCollection.find({ chatId: chatId }).toArray();
        return { chatName: friendName, chats: chats };
    }
    async getChatId(from, username) {
        const usersCollection = this.getDb("users");
        const user = await usersCollection.findOne({ username });
        if (user) {
            const chat = user.chats.find((c) => c.name === from);
            return chat?.chatId ?? null;
        }
        return null;
    }
    async storeChatInDb(chat) {
        const conversations = this.getDb("conversations");
        conversations.insertOne(chat);
        return "successfully stored!";
    }
    async storeChat({ from, to, msg }, username) {
        const id = await this.getChatId(from, username);
        return this.storeChatInDb({ from, to, msg, chatId: id });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map