import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class ValidateUserName implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
}
