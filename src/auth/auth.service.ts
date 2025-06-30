import { Injectable, Res } from "@nestjs/common";
import { captureRejectionSymbol } from "events";
import { urlencoded } from "express";
import { ConnectionCheckOutStartedEvent } from "mongodb";
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
      msg: "hello",
      chatId: 1,
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
    const user = usersCollection.find(
      { username },
      { projection: { username: 1, chats: 1 } }
    );

    // user.chats = [
    //   {
    //     name: 'bhagya',
    //     lastMessage: "Hey what's up ?",
    //     chatId: '1',
    //   },
    //   {
    //     name: 'abc',
    //     lastMessage: 'Hey there !',
    //     chatId: '2',
    //   },
    //   {
    //     name: 'Guy 1',
    //     lastMessage: 'Hi',
    //     chatId: '3',
    //   },
    // ];
    const chatList = (await user.toArray())[0];

    return chatList;
  }

  async getFriendName(frndName: string, sessionId: string) {
    const usersCollection = this.getDb("users");
    const username = this.sessions[sessionId];
    const chats = await usersCollection
      .find({ username: username }, { projection: { chats: 1 } })
      .toArray();
    // const chats = [
    //   {
    //     name: "bhagya",
    //     lastMessage: "Hey what's up ?",
    //     chatId: "1",
    //   },
    //   {
    //     name: "abc",
    //     lastMessage: "Hey there !",
    //     chatId: "2",
    //   },
    //   {
    //     name: "Guy 1",
    //     lastMessage: "Hi",
    //     chatId: "3",
    //   },
    // ];
    console.log("chats:", chats);
    const chatId = chats.find((chat) => chat.name === frndName)?.chatId;
    console.log("chatId:", chatId);
    const index = chats[0].chats.findIndex((chat) => chat.chatId === chatId);
    return [chats[0].chats[index].name, chatId];
  }

  async showChat(frndName: string, sessionId: string) {
    const [friendName, chatId] = await this.getFriendName(frndName, sessionId);
    const chatCollection = this.getDb("conversations");
    const chats = await chatCollection.find({ chatId: chatId }).toArray();

    return { chatName: friendName, chats: chats };
  }

  async getChatId(from, username) {
    const usersCollection = this.getDb("users");
    const user = await usersCollection.findOne({ username });

    if (user) {
      const chat = user.chats.find((c: ChatMeta) => c.name === from);

      return chat?.chatId ?? null;
    }

    return null;
  }

  async storeChatInDb(chat: Chat) {
    const conversations = this.getDb("conversations");
    conversations.insertOne(chat);

    return "successfully stored!";
  }

  async storeChat({ from, to, msg }, username) {
    const id = await this.getChatId(from, username);

    return this.storeChatInDb({ from, to, msg, chatId: id });
  }
}
