"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const db_1 = __importDefault(require("../../utils/db"));
const note_comments_1 = __importDefault(require("./note-comments"));
const NoteCommentMentions = db_1.default.define('note_comment_mentions', {
    id: {
        type: sequelize_1.default.UUID,
        defaultValue: sequelize_1.default.UUIDV4,
        primaryKey: true,
    },
    comment_id: {
        type: sequelize_1.default.UUID,
        allowNull: false,
        references: {
            model: note_comments_1.default,
            key: 'id',
        },
    },
    mention_id: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    org_id: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    }
});
exports.default = NoteCommentMentions;
//# sourceMappingURL=note-comment-mentions.js.map