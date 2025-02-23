"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const db_1 = __importDefault(require("../../utils/db"));
const tags_1 = __importDefault(require("../tags/tags"));
const notes_1 = __importDefault(require("./notes"));
const NoteTags = db_1.default.define('note_tags', {
    id: {
        type: sequelize_1.default.UUID,
        defaultValue: sequelize_1.default.UUIDV4,
        primaryKey: true,
    },
    note_id: {
        type: sequelize_1.default.UUID,
        allowNull: false,
        references: {
            model: notes_1.default,
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
NoteTags.belongsTo(tags_1.default, {
    foreignKey: 'tag_id',
    as: 'tags',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
exports.default = NoteTags;
//# sourceMappingURL=note-tags.js.map