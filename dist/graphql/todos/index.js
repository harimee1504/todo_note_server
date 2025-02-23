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
const create_todo_1 = require("../../services/todos/create-todo");
const delete_todo_1 = require("../../services/todos/delete-todo");
const get_todo_1 = require("../../services/todos/get-todo");
const update_todo_1 = require("../../services/todos/update-todo");
const update_todo_status_1 = require("../../services/todos/update-todo-status");
const utils_1 = require("../../utils/utils");
const todo = {
    Query: {
        getTodo: (0, utils_1.withAuthMiddleware)('org:todo:read', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, get_todo_1.getTodo)(payload, context); })),
    },
    Mutation: {
        createTodo: (0, utils_1.withAuthMiddleware)('org:todo:create', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, create_todo_1.createTodo)(payload, context); })),
        updateTodo: (0, utils_1.withAuthMiddleware)('org:todo:update', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, update_todo_1.updateTodo)(payload, context); })),
        updateTodoStatus: (0, utils_1.withAuthMiddleware)('org:todo:update', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, update_todo_status_1.updateTodoStatus)(payload, context); })),
        deleteTodo: (0, utils_1.withAuthMiddleware)('org:todo:delete', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, delete_todo_1.deleteTodo)(payload, context); })),
    }
};
exports.default = todo;
//# sourceMappingURL=index.js.map