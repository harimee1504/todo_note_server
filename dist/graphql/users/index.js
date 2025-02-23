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
const utils_1 = require("../../utils/utils");
const user = {
    Query: {
        getUsersByOrg: (_, __, context) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const users = yield (0, utils_1.getUsers)(context.req.auth.orgId);
                const userData = users.data.map((user) => {
                    return {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.emailAddresses[0].emailAddress,
                        imageUrl: user.imageUrl
                    };
                });
                return userData;
            }
            catch (error) {
                console.error('Failed to fetch users:', error);
                throw new Error('Failed to fetch users.');
            }
        })
    }
};
exports.default = user;
//# sourceMappingURL=index.js.map