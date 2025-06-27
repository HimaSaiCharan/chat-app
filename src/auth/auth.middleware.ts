import { Body, Injectable, NestMiddleware, Res } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

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
    if (name.includes(' ')) {
      return res.json({ isAccountCreated: false, message: 'invalid UserName' });
    }
    next();
  }
}
