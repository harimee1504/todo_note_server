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
const create_todo_comment_1 = require("../../services/todo-comments/create-todo-comment");
const delete_todo_comment_1 = require("../../services/todo-comments/delete-todo-comment");
const get_todo_comments_1 = require("../../services/todo-comments/get-todo-comments");
const update_todo_comment_1 = require("../../services/todo-comments/update-todo-comment");
const utils_1 = require("../../utils/utils");
const todoComments = {
    Query: {
        getTodoComments: (0, utils_1.withAuthMiddleware)('org:todo:read', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, get_todo_comments_1.getTodoComments)(payload, context); })),
    },
    Mutation: {
        createTodoComment: (0, utils_1.withAuthMiddleware)('org:todo:create', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, create_todo_comment_1.createTodoComment)(payload, context); })),
        updateTodoComment: (0, utils_1.withAuthMiddleware)('org:todo:update', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, update_todo_comment_1.updateTodoComment)(payload, context); })),
        deleteTodoComment: (0, utils_1.withAuthMiddleware)('org:todo:delete', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, delete_todo_comment_1.deleteTodoComment)(payload, context); })),
    }
};
exports.default = todoComments;
//# sourceMappingURL=index.js.map