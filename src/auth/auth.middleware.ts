import { Body, Injectable, NestMiddleware, Res } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  }
}

export class ValidateUserName implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const name = req.body.username;
    if (name.includes(" ")) {
      return res.json({ isAccountCreated: false, message: "invalid UserName" });
    }
    next();
  }
}

export class Authentication implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const sessionId = req.cookies.sessionId;
    console.log("sessionId ::", sessionId);
    console.log("path", req.url);

    if (sessionId) {
      const username = this.authService.getUsername(sessionId);
      console.log("username :: ", username);

      if (username) return next();
    }

    return res.redirect(303, "/signUp.html");
  }
}
