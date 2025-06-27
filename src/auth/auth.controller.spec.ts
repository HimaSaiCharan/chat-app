import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authservice: AuthService;

  beforeEach(async () => {
    const Auth: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authController = Auth.get<AuthController>(AuthController);
    authservice = Auth.get<AuthService>(AuthService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(authservice.chatList('Malli')).toBe('Hello World!');
    });
  });
});
