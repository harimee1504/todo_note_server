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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTodo = void 0;
const todos_1 = __importDefault(require("../../models/todos/todos"));
const utils_1 = require("../../utils/utils");
const deleteTodo = (payload, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transaction = yield ((_a = todos_1.default.sequelize) === null || _a === void 0 ? void 0 : _a.transaction());
    try {
        const deletedRowsCount = yield todos_1.default.destroy({ where: { id: payload.input.id, org_id: context.req.auth.orgId }, transaction });
        if (deletedRowsCount === 0) {
            throw new utils_1.CustomError('Todo not found.');
        }
        else {
            yield (transaction === null || transaction === void 0 ? void 0 : transaction.commit());
            return { deleted: true };
        }
    }
    catch (error) {
        yield (transaction === null || transaction === void 0 ? void 0 : transaction.rollback());
        if (error instanceof utils_1.CustomError) {
            throw new utils_1.CustomError(error.message);
        }
        console.error(error);
        throw new utils_1.CustomError('Failed to delete todo.');
    }
});
exports.deleteTodo = deleteTodo;
