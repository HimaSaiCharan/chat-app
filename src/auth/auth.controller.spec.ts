import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { DatabaseService } from "src/database/database.service";
import { UserInfo } from "../types";
import { Collection } from "mongodb";

describe("AuthController", () => {
  let authController: AuthController;
  let authservice: AuthService;

  beforeEach(async () => {
    const mockDatabaseService = {
      getDb: jest.fn(),
    };

    const Auth: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    authController = Auth.get<AuthController>(AuthController);
    authservice = Auth.get<AuthService>(AuthService);
  });

  describe("signupUser", () => {
    it("should return success response when user is not there", async () => {
      const res = {
        json: jest.fn(),
      };

      const mockInsertOne = jest.fn();
      const mockCollection = {
        insertOne: mockInsertOne,
      };

      jest.spyOn(authservice as any, "getDb").mockReturnValue(mockCollection);
      jest
        .spyOn(authservice as any, "isUserAlreadyThere")
        .mockResolvedValue(false);

      await authservice.signupUser("malli", "123", res);

      expect(res.json).toHaveBeenCalledWith({
        isAccountCreated: true,
        message: "Account created successfully",
        url: "../signIn.html",
      });

      expect(mockInsertOne).toHaveBeenCalledWith({
        username: "malli",
        password: "123",
        chats: [],
      });
    });

    it("should return false response when user already there", async () => {
      const res = {
        json: jest.fn(),
      };
      const mockInsertOne = jest.fn();
      const mockCollection = {
        inserOne: mockInsertOne,
      };

      jest.spyOn(authservice as any, "getDb").mockReturnValue(mockCollection);
      jest
        .spyOn(authservice as any, "isUserAlreadyThere")
        .mockResolvedValue(true);

      await authservice.signupUser("malli", "123", res);
      expect(res.json).toHaveBeenCalledWith({
        isAccountCreated: false,
        message: "malli is already used",
        url: null,
      });
    });
  });

  describe("signinUser", () => {
    it("should return success response when user is already there", async () => {
      const mockFind = jest.fn();

      const mockUsers = [
        { username: "malli", password: "123" },
        { username: "superMan", password: "231" },
      ];

      const mockCollection = {
        find: mockFind.mockReturnValue(mockUsers),
      };
      const res = {
        json: jest.fn(),
      };

      jest.spyOn(authservice as any, "getDb").mockReturnValue(mockCollection);
      jest.spyOn(authservice as any, "createSession").mockReturnValue("");
      await authservice.signinUser("malli", "123", res);
      expect(res.json).toHaveBeenCalledWith({
        isExist: true,
        url: "../index.html",
      });
    });

    it("should return false response when user not there", async () => {
      const mockUsers = [{ username: "ironMan", password: "" }];
      const mockfind = jest.fn().mockReturnValue(mockUsers);
      const mockCollection = {
        find: mockfind,
      };
      const res = {
        json: jest.fn(),
      };

      jest.spyOn(authservice as any, "getDb").mockReturnValue(mockCollection);
      jest.spyOn(authservice as any, "createSession").mockReturnValue("");

      await authservice.signinUser("batMan", "123", res);
      expect(res.json).toHaveBeenCalledWith({ isExist: false });
    });
  });

  describe("chatList", () => {
    it("should return the user friends", async () => {
      const mockUsers = [
        {
          chats: [{ name: "ironMan", lastMessage: "hello", chatId: "1" }],
        },
      ];
      const mockToArray = jest.fn().mockReturnValue(mockUsers);
      const mockFind = jest.fn().mockReturnValue({ toArray: mockToArray });
      const mockCollection = {
        find: mockFind,
      };

      jest.spyOn(authservice as any, "getDb").mockReturnValue(mockCollection);
      const value = await authservice.chatList("sperMan");
      expect(value).toEqual({
        chats: [{ chatId: "1", lastMessage: "hello", name: "ironMan" }],
      });
    });
  });

  describe("Helper-methods", () => {
    it("isUserAlreadyThere() => should return true when user not there", async () => {
      const mockdata = [{ username: "Malli", password: "12", chats: [] }];
      const mockTOArray = jest.fn().mockReturnValue(mockdata);
      const mockFind = jest.fn().mockReturnValue({ toArray: mockTOArray });
      const mockCollection = { find: mockFind } as unknown as jest.Mocked<
        Collection<UserInfo>
      >;

      expect(
        await authservice.isUserAlreadyThere("malli", mockCollection)
      ).toBe(true);
    });

    it("getFriendChatId() => should return chatID:1", async () => {
      const mockUser = {
        username: "malli",
        password: "123",
        chats: [{ name: "a", lastMessage: "hi", chatId: "1" }],
      };

      const mockFindOne = jest.fn().mockResolvedValue(mockUser);

      const mockCollection = {
        findOne: mockFindOne,
      } as unknown as jest.Mocked<Collection<UserInfo>>;

      jest.spyOn(authservice as any, "getDb").mockReturnValue(mockCollection);

      expect(await authservice.getFriendChatId("malli", "12")).toBe("1");
    });

    
  });

  describe("showChat", () => {
    it("should return the chat details", async () => {
      const mockData = [{ from: "malli", to: "bhagya", message: "hello" }];
      const mockToArray = jest.fn().mockReturnValue(mockData);
      const mockFind = jest.fn().mockReturnValue({ toArray: mockToArray });
      const mockCollection = {
        find: mockFind,
      } as unknown as jest.Mocked<Collection<UserInfo>>;

      jest.spyOn(authservice as any, "getDb").mockReturnValue(mockCollection);
      jest.spyOn(authservice as any, "getFriendChatId").mockReturnValue("1");
      expect(await authservice.showChat("malli", "12")).toEqual({
        chatName: "malli",
        chats: [{ from: "malli", to: "bhagya", message: "hello" }],
        success: true,
      });
    });
    describe("searchPeople", () => {
      it("should return the people names with that letter", async () => {
        const mockUsers = [{ username: "batMan", password: "1", chats: [] }];
        const mockToArray = jest.fn().mockReturnValue(mockUsers);
        const mockFind = jest.fn().mockReturnValue({ toArray: mockToArray });
        const mockCollection = {
          find: mockFind,
        };

        jest.spyOn(authservice as any, "getDb").mockReturnValue(mockCollection);
        jest.spyOn(authservice as any, "getFriends").mockReturnValue([]);

        const people = await authservice.searchPeople("b", "ironMan");
        expect(people).toEqual([{ username: "batMan", isFriend: false }]);
      });
    });
  });
});
