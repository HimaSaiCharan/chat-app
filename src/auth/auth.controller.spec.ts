import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { DatabaseService } from "src/database/database.service";
import { UserInfo } from "../types";

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
});
