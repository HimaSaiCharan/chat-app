import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  Param,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";
import { join } from "path";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  logger() {
    console.log("inside logger");
  }

  @Post("/signup")
  signupUser(@Body() body: any, @Res() res: Response) {
    return this.authService.signupUser(body.username, body.password, res);
  }

  @Post("/signin")
  signinUser(@Body() body: any, @Res() res: Response) {
    return this.authService.signinUser(body.username, body.password, res);
  }

  @Get("/chat-list")
  async getFriends(@Req() req: Request) {
    const sessionId = req.cookies.sessionId;
    const username = this.authService.getUsername(sessionId);
    const frnds = await this.authService.chatList(username);

    return { data: frnds, success: true };
  }

  @Get("/chat/:frndName")
  showChat(@Param("frndName") frndName: string, @Req() req: Request) {
    console.log("frined name:", frndName);
    return this.authService.showChat(frndName, req.cookies.sessionId);
  }

  @Post("/storechat")
  stroreChat(@Body() data, @Req() req: Request) {
    const sessionId = req.cookies.sessionId;

    const username = this.authService.getUsername(sessionId);
    return this.authService.storeChat(data, username);
  }
}
