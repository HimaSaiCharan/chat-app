import { Body, Injectable, NestMiddleware, Res, Req } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

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
      return res.json({
        isAccountCreated: false,
        message: "Invalid User name",
      });
    }
    next();
  }
}

export class TerminateSession implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.clearCookie("sessionId", { path: "/signin" });
    return res.json({
      success: true,
      redirectTo: "http://localhost:8000/signin.html",
      message: "Logout successfully",
    });
  }
}
