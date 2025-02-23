"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const db_1 = __importDefault(require("../../utils/db"));
const todos_1 = __importDefault(require("./todos"));
const todo_comment_mentions_1 = __importDefault(require("./todo-comment-mentions"));
const TodoComments = db_1.default.define('todo_comments', {
    id: {
        type: sequelize_1.default.UUID,
        defaultValue: sequelize_1.default.UUIDV4,
        primaryKey: true,
    },
    todo_id: {
        type: sequelize_1.default.UUID,
        allowNull: false,
        references: {
            model: todos_1.default,
            key: 'id'
        }
    },
    comment: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    createdBy: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    updatedBy: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    org_id: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    }
});
TodoComments.hasMany(todo_comment_mentions_1.default, {
    foreignKey: 'comment_id',
    as: 'todoCommentMentions',
});
exports.default = TodoComments;
//# sourceMappingURL=todo-comments.js.map