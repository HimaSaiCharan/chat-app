import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  Param,
  Query,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  logger() {
    console.log("inside logger");
  }

  @Post("/signup")
  signupUser(
    @Body() body: { username: string; password: string },
    @Res() res: Response
  ) {
    return this.authService.signupUser(body.username, body.password, res);
  }

  @Post("/signin")
  signinUser(
    @Body() body: { username: string; password: string },
    @Res() res: Response
  ) {
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

  @Post("/chat/:frndName")
  stroreChat(
    @Body() data: { message: string },
    @Req() req: Request,
    @Param("frndName") name: string
  ) {
    const sessionId = req.cookies.sessionId;
    const username = this.authService.getUsername(sessionId);
    const message = data.message;

    return this.authService.storeChat(name, message, username);
  }

  @Get("/search")
  searchPeople(@Query() { name }: { name: string }, @Req() req: Request) {
    const sessionId = req.cookies.sessionId;
    if (name === "") return [];

    return this.authService.searchPeople(
      name,
      this.authService.getUsername(sessionId)
    );
  }

  @Get("/request")
  addFriend(@Query() { name }: { name: string }, @Req() req: Request) {
    const userName = this.authService.getUsername(req.cookies.sessionId);

    return this.authService.addFriend(userName, name);
  }
}
