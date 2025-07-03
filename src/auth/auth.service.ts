import { Injectable, Res } from "@nestjs/common";
import { Collection } from "mongodb";
import { DatabaseService } from "src/database/database.service";
import { Chat, ChatMeta, UserInfo, Document } from "src/types";

@Injectable()
export class AuthService {
  constructor(private readonly dbService: DatabaseService) {}

  private userInfo: UserInfo = {
    username: "",
    password: "",
    chats: [],
  };

  private counter: number = 0;

  private sessions: object = { "123": "bhagya" };

  getUsername(sessionId: string) {
    return this.sessions[sessionId];
  }

  private getDb<T extends Document>(dbName: string): Collection<T> {
    const db = this.dbService.getDb();

    return db.collection<T>(dbName);
  }

  async isUserAlreadyThere(
    username: string,
    usersCollection: Collection<UserInfo>
  ) {
    const values = await usersCollection.find({ username: username }).toArray();

    return values.length > 0;
  }

  createSession = (username: string, res) => {
    const cookie = Math.random().toString(36).substring(2);
    res.cookie("sessionId", cookie);
    this.sessions[cookie] = username;
  };

  async signupUser(username: string, password: string, res) {
    const usersCollection: Collection<UserInfo> = this.getDb<UserInfo>("users");
    const value = await this.isUserAlreadyThere(username, usersCollection);

    if (value) {
      return res.json({
        isAccountCreated: false,
        message: `${username} is already used`,
        url: null,
      });
    }

    this.userInfo = {
      username,
      password,
      chats: [],
    };

    await usersCollection.insertOne(this.userInfo);

    return res.json({
      isAccountCreated: true,
      message: "Account created successfully",
      url: "../signIn.html",
    });
  }

  async signinUser(username: string, password: string, res) {
    const usersCollection: Collection<UserInfo> = this.getDb<UserInfo>("users");
    const users = usersCollection.find();

    for await (const user of users) {
      if (user.username === username && user.password === password) {
        this.createSession(username, res);
        return res.json({ isExist: true, url: "../index.html" });
      }
    }

    return res.json({ isExist: false });
  }

  async chatList(username: string) {
    const usersCollection: Collection<UserInfo> = this.getDb<UserInfo>("users");
    const user = await usersCollection
      .find({ username }, { projection: { username: 1, chats: 1 } })
      .toArray();
    return user[0];
  }

  async getFriendName(frndName: string, sessionId: string) {
    const usersCollection: Collection<UserInfo> = this.getDb<UserInfo>("users");
    const username = this.sessions[sessionId];
    const results = await usersCollection.findOne(
      { username, "chats.name": frndName },
      { projection: { _id: 0, "chats.$": 1 } }
    );
    const [chats]: any = results?.chats;

    return chats.chatId;
  }

  async showChat(frndName: string, sessionId: string) {
    const chatId = await this.getFriendName(frndName, sessionId);
    const chatCollection: Collection<Chat> = this.getDb<Chat>("conversations");
    const chats = await chatCollection.find({ chatId }).toArray();

    return { chatName: frndName, chats, success: true };
  }

  async getChatId(to: string, username: string) {
    const usersCollection: Collection<UserInfo> = this.getDb<UserInfo>("users");
    const user = await usersCollection.findOne({ username });
    if (user) {
      const chat = user.chats.find((c: ChatMeta) => c.name === to);
      return chat?.chatId ?? null;
    }

    return null;
  }

  async storeChatInDb(chat: Chat) {
    const conversations: Collection<Chat> = this.getDb<Chat>("conversations");
    conversations.insertOne(chat);
    return { success: true, message: "Successfully Send" };
  }

  async updatelastMsg(message: string, username: string, frndName: string) {
    const usersCollection: Collection<UserInfo> = this.getDb<UserInfo>("users");
    await usersCollection.updateOne(
      { username, "chats.name": frndName },
      { $set: { "chats.$.lastMessage": message } }
    );

    await usersCollection.updateOne(
      { username: frndName, "chats.name": username },
      { $set: { "chats.$.lastMessage": message } }
    );
  }

  async storeChat(to: string, message: string, from: string) {
    this.updatelastMsg(message, from, to);
    const chatId = await this.getChatId(to, from);

    return this.storeChatInDb({ from, to, message, chatId });
  }

  private getFriends = async (username: string) => {
    const usersCollection: Collection<UserInfo> = this.getDb<UserInfo>("users");
    const chats = await usersCollection
      .find({ username }, { projection: { chats: 1 } })
      .toArray();

    const names = chats.flatMap((chat) => {
      return chat.chats.map((c: ChatMeta) => c.name);
    });

    return names;
  };

  async searchPeople(name: string, user: string) {
    const usersCollection: Collection<UserInfo> = this.getDb<UserInfo>("users");
    const users = await usersCollection
      .find(
        {
          username: { $regex: `^${name}`, $options: "i" },
        },
        { projection: { username: 1 } }
      )
      .toArray();
    const friends = await this.getFriends(user);

    const people = users.map(({ _id, username }) => {
      return { username, isFriend: friends.includes(username) };
    });

    return people.filter((person) => person.username !== user).slice(0, 10);
  }

  async addFriend(username: string, name: string): Promise<object> {
    const db = this.dbService.getDb();
    // const users: Collection<UserInfo> = db.collection("users");
    const users: Collection<UserInfo> = this.getDb<UserInfo>("users");

    if (!(await this.isUserAlreadyThere(name, users))) {
      return { success: false, message: "Invalid friend name" };
    }

    const friends = await this.getFriends(username);
    if (friends.includes(name)) {
      return { success: false, message: `${name} is already a friend` };
    }

    this.counter += 1;
    const chat: ChatMeta = {
      name,
      lastMessage: "",
      chatId: this.counter.toString(),
    };

    const userChat: ChatMeta = {
      name: username,
      lastMessage: "",
      chatId: this.counter.toString(),
    };

    await users.updateOne(
      { username },
      {
        $push: { chats: chat },
      }
    );

    await users.updateOne(
      { username: name },
      {
        $push: { chats: userChat },
      }
    );

    return { success: true, message: "Friend added successfully" };
  }
}
