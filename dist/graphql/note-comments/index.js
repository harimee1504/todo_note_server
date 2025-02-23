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
Object.defineProperty(exports, "__esModule", { value: true });
const create_note_comment_1 = require("../../services/note-comments/create-note-comment");
const delete_note_comment_1 = require("../../services/note-comments/delete-note-comment");
const get_note_comments_1 = require("../../services/note-comments/get-note-comments");
const update_note_comment_1 = require("../../services/note-comments/update-note-comment");
const utils_1 = require("../../utils/utils");
const noteComments = {
    Query: {
        getNoteComments: (0, utils_1.withAuthMiddleware)('org:note:read', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, get_note_comments_1.getNoteComments)(payload, context); })),
    },
    Mutation: {
        createNoteComment: (0, utils_1.withAuthMiddleware)('org:note:create', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, create_note_comment_1.createNoteComment)(payload, context); })),
        updateNoteComment: (0, utils_1.withAuthMiddleware)('org:note:update', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, update_note_comment_1.updateNoteComment)(payload, context); })),
        deleteNoteComment: (0, utils_1.withAuthMiddleware)('org:note:delete', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, delete_note_comment_1.deleteNoteComment)(payload, context); })),
    }
};
exports.default = noteComments;
//# sourceMappingURL=index.js.map