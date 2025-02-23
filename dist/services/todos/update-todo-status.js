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
exports.updateTodoStatus = void 0;
const utils_1 = require("../../utils/utils");
const todos_1 = __importDefault(require("../../models/todos/todos"));
const updateTodoStatus = (payload, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transaction = yield ((_a = todos_1.default.sequelize) === null || _a === void 0 ? void 0 : _a.transaction());
    try {
        const data = Object.assign(Object.assign({}, payload.input), { updatedBy: context.req.auth.userId, org_id: context.req.auth.orgId });
        let { id: todo_id } = data;
        const [updatedRowsCount] = yield todos_1.default.update(data, {
            where: { id: todo_id, org_id: context.req.auth.orgId },
            transaction
        });
        if (updatedRowsCount === 0) {
            throw new utils_1.CustomError('Todo not found.');
        }
        else {
            const todo = yield todos_1.default.findByPk(todo_id);
            if (!todo) {
                throw new utils_1.CustomError('Todo not found after status update.');
            }
            yield (transaction === null || transaction === void 0 ? void 0 : transaction.commit());
            return { "updated": true };
        }
    }
    catch (error) {
        yield (transaction === null || transaction === void 0 ? void 0 : transaction.rollback());
        console.error(error);
        if (error instanceof utils_1.CustomError) {
            throw new utils_1.CustomError(error.message);
        }
        throw new utils_1.CustomError('Failed to update todo status.');
    }
});
exports.updateTodoStatus = updateTodoStatus;
