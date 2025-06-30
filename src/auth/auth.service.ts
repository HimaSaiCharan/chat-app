import { Injectable, Res } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { Chat, ChatMeta, Conversations, message, UserInfo } from "src/types";

@Injectable()
export class AuthService {
  constructor(private readonly dbService: DatabaseService) {}

  userInfo: UserInfo = {
    username: "",
    password: "",
    chats: [],
  };

  sessions: object = { "123": "Malli" };

  getUsername(sessionId: string) {
    return this.sessions[sessionId];
  }

  getDb(dbName) {
    const db = this.dbService.getDb();
    return db.collection(dbName);
  }

  async isNameValid(username: string, usersCollection) {
    const values = await usersCollection.find({ username: username }).toArray();
    if (values.length > 0) {
      return false;
    }
    return true;
  }

  createSession = (username: string, res) => {
    const cookie = Math.random().toString(36).substring(2);
    res.cookie("sessionId", cookie);
    this.sessions[cookie] = username;
  };

  async signupUser(username: string, password: string, res) {
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
      message: "hello",
      chatId: "1",
    });

    return res.json({
      isAccountCreated: true,
      message: "Account created successfully",
      url: "../signIn.html",
    });
  }

  async signinUser(username: string, password: string, res) {
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

  async chatList(username: string) {
    const usersCollection = this.getDb("users");
    const user = await usersCollection
      .find({ username }, { projection: { username: 1, chats: 1 } })
      .toArray();
    return user[0];
  }

  async getFriendName(frndName: string, sessionId: string) {
    const usersCollection = this.getDb("users");
    const username = this.sessions[sessionId];
    const results = await usersCollection.findOne(
      { username, "chats.name": frndName },
      { projection: { _id: 0, "chats.$": 1 } }
    );
    const [chats] = results?.chats;

    return chats.chatId;
  }

  async showChat(frndName: string, sessionId: string) {
    const chatId = await this.getFriendName(frndName, sessionId);
    const chatCollection = this.getDb("conversations");
    const chats = await chatCollection.find({ chatId }).toArray();
    return { chatName: frndName, chats, success: true };
  }

  async getChatId(to: string, username: string) {
    const usersCollection = this.getDb("users");
    const user = await usersCollection.findOne({ username });
    if (user) {
      const chat = user.chats.find((c: ChatMeta) => c.name === to);
      return chat?.chatId ?? null;
    }

    return null;
  }

  async storeChatInDb(chat: Chat) {
    const conversations = this.getDb("conversations");
    conversations.insertOne(chat);
    return { success: true, message: "Successfully Send" };
  }

  async updatelastMsg(message: string, username: string) {
    const usersCollection = this.getDb("users");
    await usersCollection.updateOne(
      { username },
      { $set: { lastMessage: message } }
    );
  }

  async storeChat(to: string, message: string, from: string) {
    this.updatelastMsg(message, from);
    const chatId = await this.getChatId(to, from);

    return this.storeChatInDb({ from, to, message, chatId });
  }
}
