"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const user_todo_assignments_1 = __importDefault(require("./user-todo-assignments"));
const todo_tags_1 = __importDefault(require("./todo-tags"));
const db_1 = __importDefault(require("../../utils/db"));
const todo_comments_1 = __importDefault(require("./todo-comments"));
const user_todo_mentions_1 = __importDefault(require("./user-todo-mentions"));
const Todos = db_1.default.define('todos', {
    id: {
        type: sequelize_1.default.UUID,
        defaultValue: sequelize_1.default.UUIDV4,
        primaryKey: true,
    },
    todo: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.default.TEXT,
        allowNull: false,
    },
    createdBy: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    org_id: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    updatedBy: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    isPrivate: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    dueDate: {
        type: sequelize_1.default.DATE,
        allowNull: true,
    },
    status: {
        type: sequelize_1.default.ENUM('notStarted', 'active', 'onHold', 'completed', 'overdue'),
        allowNull: false,
        defaultValue: 'notStarted',
    },
});
Todos.hasMany(user_todo_assignments_1.default, {
    foreignKey: 'todo_id',
    as: 'assignees',
});
Todos.hasMany(user_todo_mentions_1.default, {
    foreignKey: 'todo_id',
    as: 'mentions',
});
Todos.hasMany(todo_comments_1.default, {
    foreignKey: 'todo_id',
    as: 'todoComments',
});
Todos.hasMany(todo_tags_1.default, {
    foreignKey: 'todo_id',
    as: 'todoTags',
    onDelete: 'CASCADE',
});
exports.default = Todos;
//# sourceMappingURL=todos.js.map