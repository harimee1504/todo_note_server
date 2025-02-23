"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.CustomError = exports.withAuthMiddleware = void 0;
const express_1 = require("@clerk/express");
const server_1 = require("../server");
const express_2 = require("@clerk/express");
const withPermission = (context, permission) => {
    const { req } = context;
    const auth = (0, express_1.getAuth)(req);
    if (!auth || !auth.userId) {
        throw new Error('Unauthorized Access');
    }
    else if (!auth.has({ permission })) {
        throw new Error('User does not have permission or Forbidden!');
    }
    return (fn) => fn(auth);
};
const withAuthMiddleware = (permission, resolver) => {
    return (_, args, context) => {
        const withPerm = withPermission(context, permission);
        if (withPerm) {
            return withPerm(() => resolver(_, args, context));
        }
    };
};
exports.withAuthMiddleware = withAuthMiddleware;
class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = "CustomError";
    }
}
exports.CustomError = CustomError;
const getUsers = (org_id) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = `users-${org_id}`;
    const cachedUsers = server_1.cache.get(cacheKey);
    if (cachedUsers) {
        return cachedUsers;
    }
    const usersList = yield express_2.clerkClient.users.getUserList({
        organizationId: org_id,
        limit: 10,
    });
    server_1.cache.set(cacheKey, usersList);
    return usersList;
});
exports.getUsers = getUsers;
