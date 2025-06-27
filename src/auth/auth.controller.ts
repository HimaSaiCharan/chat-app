import { Controller, Get, Post, Body, Res, Req, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  logger() {
    console.log('inside logger');
  }

  @Post('/signup')
  signupUser(@Body() body: any, @Res() res: Response) {
    return this.authService.signupUser(body.username, body.password, res);
  }

  @Post('/signin')
  signinUser(@Body() body: any, @Res() res: Response) {
    return this.authService.signinUser(body.username, body.password, res);
  }

  @Get('/chat-list')
  async getFriends(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.cookies.sessionId;
    const username = this.authService.getUsername(sessionId);
    const frnds = await this.authService.chatList(username);

    return { data: frnds, success: true };
  }

  @Get('/chat/:chatId')
  showChat(@Param('chatId') chatId: string, @Req() req: Request) {
    return this.authService.showChat(chatId, req.cookies.sessionId);
  }

  @Post('/storechat')
  stroreChat(@Body() data, @Req() req: Request) {
    const sessionId = req.cookies.sessionId;

    const username = this.authService.getUsername(sessionId);
    return this.authService.storeChat(data, username);
  }
}
