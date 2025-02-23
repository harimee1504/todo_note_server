"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const db_1 = __importDefault(require("../../utils/db"));
const todos_1 = __importDefault(require("./todos"));
const tags_1 = __importDefault(require("../tags/tags"));
const TodoTags = db_1.default.define('todo_tags', {
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
            key: 'id',
        }
    },
    tag_id: {
        type: sequelize_1.default.UUID,
        allowNull: false,
        references: {
            model: tags_1.default,
            key: 'id',
        }
    },
    org_id: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    }
});
TodoTags.belongsTo(tags_1.default, {
    foreignKey: 'tag_id',
    as: 'tags',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
exports.default = TodoTags;
//# sourceMappingURL=todo-tags.js.map