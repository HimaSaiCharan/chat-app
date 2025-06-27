import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { LoggerMiddleware, ValidateUserName } from './auth/auth.middleware';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [DatabaseService, AuthService],
  exports: [DatabaseService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');  
    consumer.apply(ValidateUserName).forRoutes('/signup');
  }
}
