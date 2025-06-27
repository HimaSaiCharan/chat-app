"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("./database/database.service");
const auth_service_1 = require("./auth/auth.service");
const auth_controller_1 = require("./auth/auth.controller");
const auth_middleware_1 = require("./auth/auth.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(auth_middleware_1.LoggerMiddleware).forRoutes('*');
        consumer.apply(auth_middleware_1.ValidateUserName).forRoutes('/signup');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [auth_controller_1.AuthController],
        providers: [database_service_1.DatabaseService, auth_service_1.AuthService],
        exports: [database_service_1.DatabaseService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map