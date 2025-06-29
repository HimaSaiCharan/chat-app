"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authentication = exports.ValidateUserName = exports.LoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
let LoggerMiddleware = class LoggerMiddleware {
    use(req, res, next) {
        console.log(`${req.method} ${req.originalUrl}`);
        next();
    }
};
exports.LoggerMiddleware = LoggerMiddleware;
exports.LoggerMiddleware = LoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], LoggerMiddleware);
class ValidateUserName {
    use(req, res, next) {
        const name = req.body.username;
        if (name.includes(" ")) {
            return res.json({ isAccountCreated: false, message: "invalid UserName" });
        }
        next();
    }
}
exports.ValidateUserName = ValidateUserName;
class Authentication {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    use(req, res, next) {
        const sessionId = req.cookies.sessionId;
        console.log("sessionId ::", sessionId);
        console.log("path", req.url);
        if (sessionId) {
            const username = this.authService.getUsername(sessionId);
            console.log("username :: ", username);
            if (username)
                return next();
        }
        return res.redirect(303, "/signUp.html");
    }
}
exports.Authentication = Authentication;
//# sourceMappingURL=auth.middleware.js.map