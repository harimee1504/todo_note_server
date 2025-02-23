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
exports.getTodoByMentions = exports.getTodoByAssignedTo = exports.getTodoByTags = exports.getFilteredTodo = exports.getFilterQuery = void 0;
const sequelize_1 = require("sequelize");
const tags_1 = __importDefault(require("../../models/tags/tags"));
const todos_1 = __importDefault(require("../../models/todos/todos"));
const user_todo_assignments_1 = __importDefault(require("../../models/todos/user-todo-assignments"));
const todo_tags_1 = __importDefault(require("../../models/todos/todo-tags"));
const todo_comment_mentions_1 = __importDefault(require("../../models/todos/todo-comment-mentions"));
const user_todo_mentions_1 = __importDefault(require("../../models/todos/user-todo-mentions"));
const utils_1 = require("../../utils/utils");
const todo_comments_1 = __importDefault(require("../../models/todos/todo-comments"));
const getFilterQuery = (by, options, context) => {
    const ENUM = {
        isPrivate: () => ({
            isPrivate: {
                [sequelize_1.Op.eq]: options.isPrivate,
            }
        }),
        todo: () => ({
            todo: {
                [sequelize_1.Op.like]: `%${options.todo}%`,
            }
        }),
        description: () => ({
            description: {
                [sequelize_1.Op.like]: `%${options.description}%`,
            }
        }),
        status: () => ({
            status: {
                [sequelize_1.Op.eq]: options.status,
            }
        }),
        createdBy: () => ({
            createdBy: {
                [sequelize_1.Op.eq]: options.createdBy,
            }
        }),
        dueDate: () => ({
            [sequelize_1.Op.and]: [
                {
                    status: {
                        [sequelize_1.Op.ne]: 'completed',
                    },
                },
                {
                    dueDate: {
                        [sequelize_1.Op.eq]: options.dueDate,
                    },
                },
            ],
        }),
        dateRange: () => ({
            [sequelize_1.Op.and]: [
                {
                    status: {
                        [sequelize_1.Op.ne]: 'completed',
                    },
                },
                {
                    dueDate: {
                        [sequelize_1.Op.between]: [options.startDate, options.endDate],
                    },
                },
            ],
        })
    };
    return ENUM[by] || (() => ({}));
};
exports.getFilterQuery = getFilterQuery;
const getFilteredTodo = (by, options, context) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield (0, utils_1.getUsers)(context.req.auth.orgId);
    ;
    let userMap = {};
    users.data.map((user) => {
        userMap[user.id] = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses[0].emailAddress,
            imageUrl: user.imageUrl
        };
    });
    let query = (0, exports.getFilterQuery)(by, options, context)();
    const todos = yield todos_1.default.findAll({
        where: {
            [sequelize_1.Op.and]: [
                {
                    org_id: context.req.auth.orgId,
                },
                {
                    [sequelize_1.Op.or]: [
                        { createdBy: context.req.auth.userId },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT todo_id FROM user_todo_assignments WHERE assignee_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT todo_id FROM user_todo_mentions WHERE mention_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT todo_id FROM todo_comments WHERE comment_id IN (select comment_id from todo_comment_mentions where mention_id = '${context.req.auth.userId}'))
                            `)
                        }
                    ],
                },
                by !== "status" ? {
                    status: {
                        [sequelize_1.Op.ne]: 'completed',
                    },
                } : {},
                query
            ]
        },
        include: [
            {
                model: user_todo_assignments_1.default,
                as: 'assignees',
                attributes: ['assignee_id']
            },
            {
                model: user_todo_mentions_1.default,
                as: 'mentions',
                attributes: ['mention_id']
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
        ]
    });
    const result = todos.map(todo => {
        var _a, _b, _c, _d;
        return (Object.assign(Object.assign({}, todo.get()), { createdBy: userMap[todo.createdBy], updatedBy: userMap[todo.updatedBy], assignedTo: ((_a = todo.assignees) === null || _a === void 0 ? void 0 : _a.map((assignee) => userMap[assignee.assignee_id])) || [], mentions: ((_b = todo.mentions) === null || _b === void 0 ? void 0 : _b.map((mention) => userMap[mention.mention_id])) || [], tags: ((_c = todo.todoTags) === null || _c === void 0 ? void 0 : _c.map((todoTag) => ({ id: todoTag.tags.id, tag: todoTag.tags.tag }))) || [], comments: (_d = todo.todoComments) === null || _d === void 0 ? void 0 : _d.map((todoComment) => {
                var _a;
                return (Object.assign(Object.assign({}, todoComment.get()), { createdBy: userMap[todoComment.createdBy], updatedBy: userMap[todoComment.updatedBy], mentions: ((_a = todoComment.todoCommentMentions) === null || _a === void 0 ? void 0 : _a.map((todoMention) => userMap[todoMention.mention_id])) || [] }));
            }) }));
    });
    return result;
});
exports.getFilteredTodo = getFilteredTodo;
const getTodoByTags = (_, options, context) => __awaiter(void 0, void 0, void 0, function* () {
    const { tags = [] } = options;
    if (tags.length === 0) {
        throw new utils_1.CustomError('At least one tag must be provided.');
    }
    const users = yield (0, utils_1.getUsers)(context.req.auth.orgId);
    ;
    let userMap = {};
    users.data.map((user) => {
        userMap[user.id] = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses[0].emailAddress,
            imageUrl: user.imageUrl
        };
    });
    const tagRecords = yield tags_1.default.findAll({
        where: {
            [sequelize_1.Op.and]: [
                {
                    org_id: {
                        [sequelize_1.Op.eq]: context.req.auth.orgId,
                    },
                },
                {
                    tag: {
                        [sequelize_1.Op.in]: tags,
                    }
                }
            ]
        },
        attributes: ['id'],
    });
    if (tagRecords.length === 0) {
        return [];
    }
    const tagIds = tagRecords.map((tag) => tag.get('id'));
    const todos = yield todos_1.default.findAll({
        where: {
            [sequelize_1.Op.and]: [
                {
                    org_id: {
                        [sequelize_1.Op.eq]: context.req.auth.orgId,
                    },
                },
                {
                    [sequelize_1.Op.or]: [
                        { createdBy: context.req.auth.userId },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT todo_id FROM todo_assignments WHERE assignee_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT todo_id FROM todomentions WHERE mention_id = '${context.req.auth.userId}')
                            `)
                        }
                    ],
                },
                {
                    status: {
                        [sequelize_1.Op.ne]: 'completed',
                    },
                }
            ]
        },
        include: [
            {
                model: user_todo_assignments_1.default,
                as: 'assignees',
                attributes: ['assignee_id'],
            },
            {
                model: todo_tags_1.default,
                as: 'todoTags',
                include: [
                    {
                        model: tags_1.default,
                        as: 'tags',
                    },
                ],
                where: {
                    tag_id: {
                        [sequelize_1.Op.in]: tagIds,
                    },
                }
            },
            {
                model: user_todo_mentions_1.default,
                as: 'mentions',
                attributes: ['mention_id'],
            }
        ]
    });
    const result = todos.map(todo => {
        var _a, _b, _c;
        return (Object.assign(Object.assign({}, todo.get()), { createdBy: userMap[todo.createdBy], updatedBy: userMap[todo.updatedBy], assignedTo: ((_a = todo.assignees) === null || _a === void 0 ? void 0 : _a.map((assignee) => assignee.assignee_id)) || [], mentions: ((_b = todo.mentions) === null || _b === void 0 ? void 0 : _b.map((mention) => mention.mention_id)) || [], tags: ((_c = todo.todoTags) === null || _c === void 0 ? void 0 : _c.map((todoTag) => todoTag.tags.tag)) || [] }));
    });
    return result;
});
exports.getTodoByTags = getTodoByTags;
const getTodoByAssignedTo = (_, options, context) => __awaiter(void 0, void 0, void 0, function* () {
    const { assignedTo: assignees = [] } = options;
    if (assignees.length === 0) {
        throw new utils_1.CustomError('At least one assignee must be provided.');
    }
    const users = yield (0, utils_1.getUsers)(context.req.auth.orgId);
    ;
    let userMap = {};
    users.data.map((user) => {
        userMap[user.id] = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses[0].emailAddress,
            imageUrl: user.imageUrl
        };
    });
    const todos = yield todos_1.default.findAll({
        where: {
            [sequelize_1.Op.and]: [
                {
                    org_id: {
                        [sequelize_1.Op.eq]: context.req.auth.orgId,
                    },
                },
                {
                    [sequelize_1.Op.or]: [
                        { createdBy: context.req.auth.userId },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT todo_id FROM user_todo_assignments WHERE assignee_id = '${context.req.auth.userId}')
                            `)
                        }
                    ],
                },
                {
                    status: {
                        [sequelize_1.Op.ne]: 'completed',
                    },
                }
            ]
        },
        include: [
            {
                model: user_todo_assignments_1.default,
                as: 'assignees',
                attributes: ['assignee_id']
            },
            {
                model: user_todo_mentions_1.default,
                as: 'mentions',
                attributes: ['mention_id']
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
        ]
    });
    const result = todos.map(todo => {
        var _a, _b, _c, _d;
        return (Object.assign(Object.assign({}, todo.get()), { createdBy: userMap[todo.createdBy], updatedBy: userMap[todo.updatedBy], assignedTo: ((_a = todo.assignees) === null || _a === void 0 ? void 0 : _a.map((assignee) => userMap[assignee.assignee_id])) || [], mentions: ((_b = todo.mentions) === null || _b === void 0 ? void 0 : _b.map((mention) => userMap[mention.mention_id])) || [], tags: ((_c = todo.todoTags) === null || _c === void 0 ? void 0 : _c.map((todoTag) => ({ id: todoTag.tags.id, tag: todoTag.tags.tag }))) || [], comments: (_d = todo.todoComments) === null || _d === void 0 ? void 0 : _d.map((todoComment) => {
                var _a;
                return (Object.assign(Object.assign({}, todoComment.get()), { createdBy: userMap[todoComment.createdBy], updatedBy: userMap[todoComment.updatedBy], mentions: ((_a = todoComment.todoCommentMentions) === null || _a === void 0 ? void 0 : _a.map((todoMention) => userMap[todoMention.mention_id])) || [] }));
            }) }));
    });
    return result;
});
exports.getTodoByAssignedTo = getTodoByAssignedTo;
const getTodoByMentions = (_, options, context) => __awaiter(void 0, void 0, void 0, function* () {
    const { mentions = [] } = options;
    if (mentions.length === 0) {
        throw new utils_1.CustomError('At least one mention must be provided.');
    }
    const users = yield (0, utils_1.getUsers)(context.req.auth.orgId);
    ;
    let userMap = {};
    users.data.map((user) => {
        userMap[user.id] = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses[0].emailAddress,
            imageUrl: user.imageUrl
        };
    });
    const todos = yield todos_1.default.findAll({
        where: {
            [sequelize_1.Op.and]: [
                {
                    org_id: {
                        [sequelize_1.Op.eq]: context.req.auth.orgId,
                    },
                },
                {
                    [sequelize_1.Op.or]: [
                        { createdBy: context.req.auth.userId },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT todo_id FROM todo_assignments WHERE assignee_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT todo_id FROM todomentions WHERE mention_id = '${context.req.auth.userId}')
                            `)
                        }
                    ],
                },
                {
                    status: {
                        [sequelize_1.Op.ne]: 'completed',
                    },
                }
            ]
        },
        include: [
            {
                model: user_todo_assignments_1.default,
                as: 'assignees',
                attributes: ['assignee_id']
            },
            {
                model: todo_tags_1.default,
                as: 'todoTags',
                include: [
                    {
                        model: tags_1.default,
                        as: 'tags',
                    },
                ],
            },
            {
                model: user_todo_mentions_1.default,
                as: 'mentions',
                attributes: ['mention_id'],
                where: {
                    mention_id: {
                        [sequelize_1.Op.in]: mentions,
                    },
                }
            }
        ]
    });
    const result = todos.map(todo => {
        var _a, _b, _c;
        return (Object.assign(Object.assign({}, todo.get()), { createdBy: userMap[todo.createdBy], updatedBy: userMap[todo.updatedBy], assignedTo: ((_a = todo.assignees) === null || _a === void 0 ? void 0 : _a.map((assignee) => assignee.assignee_id)) || [], mentions: ((_b = todo.mentions) === null || _b === void 0 ? void 0 : _b.map((mention) => mention.mention_id)) || [], tags: ((_c = todo.todoTags) === null || _c === void 0 ? void 0 : _c.map((todoTag) => todoTag.tags.tag)) || [] }));
    });
    return result;
});
exports.getTodoByMentions = getTodoByMentions;
