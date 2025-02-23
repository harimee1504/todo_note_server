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
exports.updateTodo = void 0;
const tags_1 = __importDefault(require("../../models/tags/tags"));
const utils_1 = require("../../utils/utils");
const todos_1 = __importDefault(require("../../models/todos/todos"));
const todo_tags_1 = __importDefault(require("../../models/todos/todo-tags"));
const user_todo_assignments_1 = __importDefault(require("../../models/todos/user-todo-assignments"));
const todo_comments_1 = __importDefault(require("../../models/todos/todo-comments"));
const todo_comment_mentions_1 = __importDefault(require("../../models/todos/todo-comment-mentions"));
const user_todo_mentions_1 = __importDefault(require("../../models/todos/user-todo-mentions"));
const updateTodo = (payload, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const transaction = yield ((_a = todos_1.default.sequelize) === null || _a === void 0 ? void 0 : _a.transaction());
    try {
        const data = Object.assign(Object.assign({}, payload.input), { updatedBy: context.req.auth.userId, org_id: context.req.auth.orgId });
        let { id: todo_id, tags, assignedTo, mentions } = data;
        if (data.isPrivate) {
            if (data.assignedTo && data.assignedTo.length > 0) {
                throw new utils_1.CustomError('Private todos cannot be assigned to users.');
            }
        }
        if ((tags === null || tags === void 0 ? void 0 : tags.length) > 10) {
            throw new utils_1.CustomError('A todo can have a maximum of 10 tags.');
        }
        if (data.todo === null || data.todo === undefined || data.todo === '') {
            throw new utils_1.CustomError('Todo is required');
        }
        if (data.dueDate === null || data.dueDate === undefined || typeof data.dueDate !== 'string') {
            throw new utils_1.CustomError('Due Date is required');
        }
        let assigneeData = [];
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
        if (assignedTo) {
            assignedTo.map((userId) => {
                if (!userIds.includes(userId)) {
                    throw new utils_1.CustomError(`Invalid assignee ID: ${userId}`);
                }
                assigneeData.push(userMap[userId]);
            });
        }
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
        const [updatedRowsCount] = yield todos_1.default.update(data, {
            where: { id: todo_id, org_id: context.req.auth.orgId },
            transaction
        });
        if (updatedRowsCount === 0) {
            throw new utils_1.CustomError('Todo not found.');
        }
        else {
            const todo = yield todos_1.default.findByPk(todo_id, {
                include: [
                    {
                        model: user_todo_assignments_1.default,
                        as: 'assignees',
                        attributes: ['assignee_id']
                    },
                    {
                        model: todo_comments_1.default,
                        as: 'todoComments',
                        include: [
                            {
                                model: todo_comment_mentions_1.default,
                                as: 'todoCommentMentions',
                            }
                        ]
                    },
                    {
                        model: todo_tags_1.default,
                        as: 'todoTags',
                        include: [
                            {
                                model: tags_1.default,
                                as: 'tags',
                            },
                        ]
                    }
                ],
                transaction
            });
            if (!todo) {
                throw new utils_1.CustomError('Todo not found after update.');
            }
            const updatedTodo = todo.get();
            yield user_todo_assignments_1.default.destroy({
                where: { todo_id: todo_id, org_id: context.req.auth.orgId },
                transaction
            });
            yield user_todo_mentions_1.default.destroy({
                where: { todo_id: todo_id, org_id: context.req.auth.orgId },
                transaction
            });
            yield todo_tags_1.default.destroy({
                where: { todo_id: todo_id, org_id: context.req.auth.orgId },
                transaction
            });
            if (assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0) {
                const todoAssignment = assignedTo.map((userId) => ({
                    todo_id: updatedTodo.id,
                    assignee_id: userId,
                    org_id: context.req.auth.orgId
                }));
                yield user_todo_assignments_1.default.bulkCreate(todoAssignment, { transaction });
            }
            if (Array.isArray(mentions) && mentions.length > 0) {
                const todoMentions = mentions.map((userId) => ({
                    todo_id: updatedTodo.id,
                    mention_id: userId,
                    org_id: context.req.auth.orgId
                }));
                yield user_todo_mentions_1.default.bulkCreate(todoMentions, { transaction });
            }
            if (Array.isArray(tags) && tags.length > 0) {
                const todoTags = tags.map((tagId) => ({
                    todo_id: data.id,
                    tag_id: tagId,
                    org_id: context.req.auth.orgId
                }));
                yield todo_tags_1.default.bulkCreate(todoTags, { transaction });
            }
            yield (transaction === null || transaction === void 0 ? void 0 : transaction.commit());
            const result = Object.assign(Object.assign({}, todo.get()), { createdBy: userMap[todo.createdBy], assignedTo: ((_b = todo.assignees) === null || _b === void 0 ? void 0 : _b.map((assignee) => userMap[assignee.assignee_id])) || [], tags: ((_c = todo.todoTags) === null || _c === void 0 ? void 0 : _c.map((todoTag) => ({ id: todoTag.tags.id, tag: todoTag.tags.tag }))) || [], comments: (_d = todo.todoComments) === null || _d === void 0 ? void 0 : _d.map((todoComment) => {
                    var _a;
                    return (Object.assign(Object.assign({}, todoComment.get()), { mentions: ((_a = todoComment.todoCommentMentions) === null || _a === void 0 ? void 0 : _a.map((todoMention) => userMap[todoMention.mention_id])) || [] }));
                }) });
            return result;
        }
    }
    catch (error) {
        yield (transaction === null || transaction === void 0 ? void 0 : transaction.rollback());
        console.error(error);
        if (error instanceof utils_1.CustomError) {
            throw new utils_1.CustomError(error.message);
        }
        throw new utils_1.CustomError('Failed to update todo.');
    }
});
exports.updateTodo = updateTodo;
//# sourceMappingURL=update-todo.js.map