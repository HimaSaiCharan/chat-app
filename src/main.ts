import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import * as cookieParser from "cookie-parser";
import { NextFunction, Request, Response } from "express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app
    .getHttpAdapter()
    .get("/", (req: Request, res: Response, next: NextFunction) => {
      const sessionId = Object.keys(req.cookies);
      if (sessionId.length === 0) {
        return res.redirect("./signUp.html");
      }
      next();
    });
  app.useStaticAssets(join(__dirname, "..", "public"));
  await app.listen(8000);
}

bootstrap();
