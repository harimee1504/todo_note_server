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
exports.createTodo = void 0;
const utils_1 = require("../../utils/utils");
const tags_1 = __importDefault(require("../../models/tags/tags"));
const todos_1 = __importDefault(require("../../models/todos/todos"));
const todo_tags_1 = __importDefault(require("../../models/todos/todo-tags"));
const user_todo_assignments_1 = __importDefault(require("../../models/todos/user-todo-assignments"));
const user_todo_mentions_1 = __importDefault(require("../../models/todos/user-todo-mentions"));
const createTodo = (payload, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transaction = yield ((_a = todos_1.default.sequelize) === null || _a === void 0 ? void 0 : _a.transaction());
    try {
        const data = Object.assign(Object.assign({}, payload.input), { createdBy: context.req.auth.userId, updatedBy: context.req.auth.userId, org_id: context.req.auth.orgId });
        const { tags = [], assignedTo = [], mentions = [] } = payload.input;
        if (data.isPrivate) {
            if (data.assignedTo && data.assignedTo.length > 0) {
                throw new utils_1.CustomError('Private todos cannot be assigned to users.');
            }
        }
        if (tags.length > 10) {
            throw new utils_1.CustomError('A todo can have a maximum of 10 tags.');
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
        let assigneeData = [];
        assignedTo.map((userId) => {
            if (!userIds.includes(userId)) {
                throw new utils_1.CustomError(`Invalid assignee ID: ${userId}`);
            }
            assigneeData.push(userMap[userId]);
        });
        let mentionData = [];
        mentions.map((userId) => {
            if (!userIds.includes(userId)) {
                throw new utils_1.CustomError(`Invalid mention ID: ${userId}`);
            }
            mentionData.push(userMap[userId]);
        });
        let tagData = [];
        (yield Promise.all(tags.map((tagId) => __awaiter(void 0, void 0, void 0, function* () { return ({ tagId, tagData: yield tags_1.default.findByPk(tagId) }); })))).map((tag) => {
            if (!tag.tagData) {
                throw new utils_1.CustomError(`Invalid tag ID: ${tag.tagId}`);
            }
            tagData.push({
                id: tag.tagId,
                tag: tag.tagData.tag
            });
        });
        const todo = yield todos_1.default.create(data, { transaction });
        const insertedTodo = todo.get();
        if (Array.isArray(assignedTo) && assignedTo.length > 0) {
            const todoAssignment = assignedTo.map((userId) => ({
                todo_id: insertedTodo.id,
                assignee_id: userId,
                org_id: context.req.auth.orgId
            }));
            yield user_todo_assignments_1.default.bulkCreate(todoAssignment, { transaction });
        }
        if (Array.isArray(mentions) && mentions.length > 0) {
            const todoMentions = mentions.map((userId) => ({
                todo_id: insertedTodo.id,
                mention_id: userId,
                org_id: context.req.auth.orgId
            }));
            yield user_todo_mentions_1.default.bulkCreate(todoMentions, { transaction });
        }
        if (Array.isArray(tags) && tags.length > 0) {
            const todoTags = tags.map((tagId) => ({
                todo_id: insertedTodo.id,
                tag_id: tagId,
                org_id: context.req.auth.orgId
            }));
            yield todo_tags_1.default.bulkCreate(todoTags, { transaction });
        }
        yield (transaction === null || transaction === void 0 ? void 0 : transaction.commit());
        return Object.assign(Object.assign({}, insertedTodo), { createdBy: userMap[insertedTodo.createdBy], updatedBy: userMap[insertedTodo.updatedBy], assignedTo: assigneeData, tags: tagData });
    }
    catch (error) {
        yield (transaction === null || transaction === void 0 ? void 0 : transaction.rollback());
        console.error(error);
        if (error instanceof utils_1.CustomError) {
            throw new utils_1.CustomError(error.message);
        }
        throw new utils_1.CustomError('Failed to create todo.');
    }
});
exports.createTodo = createTodo;
//# sourceMappingURL=create-todo.js.map