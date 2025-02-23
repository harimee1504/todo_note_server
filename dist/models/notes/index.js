"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
const note_comments_1 = __importDefault(require("./note-comments"));
const note_tags_1 = __importDefault(require("./note-tags"));
const notes_1 = __importDefault(require("./notes"));
exports.Note = notes_1.default;
const user_note_assignments_1 = __importDefault(require("./user-note-assignments"));
const user_note_mentions_1 = __importDefault(require("./user-note-mentions"));
notes_1.default.hasMany(note_comments_1.default, {
    foreignKey: 'note_id',
    as: 'noteComments'
});
notes_1.default.hasMany(user_note_assignments_1.default, {
    foreignKey: 'note_id',
    as: 'attendees',
});
notes_1.default.hasMany(user_note_mentions_1.default, {
    foreignKey: 'note_id',
    as: 'mentions',
});
notes_1.default.hasMany(note_tags_1.default, {
    foreignKey: 'note_id',
    as: 'noteTags',
    onDelete: 'CASCADE',
});
