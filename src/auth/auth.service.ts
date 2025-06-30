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

    console.log(
      "after chatCollection --> ",
      await chatCollection.find().toArray()
    );
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

    return chats.chatId;
  }

  async showChat(frndName: string, sessionId: string) {
    const chatId = await this.getFriendName(frndName, sessionId);
    console.log("friendName - chatId ", frndName, chatId);
    const chatCollection = this.getDb("conversations");
    console.log("chatCollection :: ", await chatCollection.find().toArray());
    const chats = await chatCollection.find({ chatId }).toArray();
    console.log("chat in showChat :: ", chats);
    return { chatName: frndName, chats };
  }

  async getChatId(from: string, username: string) {
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

  async storeChat({ from, to, msg }, username: string) {
    const id = await this.getChatId(from, username);

    return this.storeChatInDb({ from, to, msg, chatId: id });
  }
}
