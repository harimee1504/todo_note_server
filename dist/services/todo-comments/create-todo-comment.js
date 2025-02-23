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
exports.createTodoComment = void 0;
const utils_1 = require("../../utils/utils");
const todos_1 = __importDefault(require("../../models/todos/todos"));
const todo_comments_1 = __importDefault(require("../../models/todos/todo-comments"));
const todo_comment_mentions_1 = __importDefault(require("../../models/todos/todo-comment-mentions"));
const createTodoComment = (payload, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transaction = yield ((_a = todo_comments_1.default.sequelize) === null || _a === void 0 ? void 0 : _a.transaction());
    try {
        const data = Object.assign(Object.assign({}, payload.input), { createdby: context.req.auth.userId, updatedBy: context.req.auth.userId, org_id: context.req.auth.orgId });
        const { mentions = [] } = payload.input;
        const todo = yield todos_1.default.findByPk(data.todo_id);
        if (!todo) {
            throw new utils_1.CustomError('Todo not found.');
        }
        const users = yield (0, utils_1.getUsers)(context.req.auth.orgId);
        ;
        let userMap = {};
        const userIds = users.data.map((user) => {
            userMap[user.id] = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.emailAddresses[0].emailAddress,
                imageUrl: user.imageUrl
            };
            return user.id;
        });
        let mentionsData = [];
        mentions.map((userId) => {
            if (!userIds.includes(userId)) {
                throw new utils_1.CustomError(`Invalid mention ID: ${userId}`);
            }
            mentionsData.push(userMap[userId]);
        });
        const todoComment = yield todo_comments_1.default.create(data, { transaction });
        const insertedTodoComment = todoComment.get();
        if (!insertedTodoComment) {
            throw new utils_1.CustomError('Failed to create todo comment.');
        }
        if (Array.isArray(mentions) && mentions.length > 0) {
            const todoCommentMentions = mentions.map((userId) => ({
                comment_id: insertedTodoComment.id,
                mention_id: userId,
                org_id: context.req.auth.orgId
            }));
            yield todo_comment_mentions_1.default.bulkCreate(todoCommentMentions, { transaction });
        }
        yield (transaction === null || transaction === void 0 ? void 0 : transaction.commit());
        return Object.assign(Object.assign({}, insertedTodoComment), { createdBy: userMap[insertedTodoComment.createdby], updatedBy: userMap[insertedTodoComment.updatedby], mentions: mentionsData, todo_id: data.todo_id });
    }
    catch (error) {
        yield (transaction === null || transaction === void 0 ? void 0 : transaction.rollback());
        console.error(error);
        if (error instanceof utils_1.CustomError) {
            throw new utils_1.CustomError(error.message);
        }
        throw new utils_1.CustomError('Failed to create todo comments.');
    }
});
exports.createTodoComment = createTodoComment;
//# sourceMappingURL=create-todo-comment.js.map