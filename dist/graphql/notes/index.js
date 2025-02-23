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
const create_note_1 = require("../../services/notes/create-note");
const delete_note_1 = require("../../services/notes/delete-note");
const get_notes_1 = require("../../services/notes/get-notes");
const update_note_1 = require("../../services/notes/update-note");
const utils_1 = require("../../utils/utils");
const note = {
    Query: {
        getNotes: (0, utils_1.withAuthMiddleware)('org:note:read', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, get_notes_1.getNotes)(payload, context); })),
    },
    Mutation: {
        createNote: (0, utils_1.withAuthMiddleware)('org:note:create', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, create_note_1.createNote)(payload, context); })),
        updateNote: (0, utils_1.withAuthMiddleware)('org:note:update', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, update_note_1.updateNote)(payload, context); })),
        deleteNote: (0, utils_1.withAuthMiddleware)('org:note:delete', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, delete_note_1.deleteNote)(payload, context); })),
    }
};
exports.default = note;
//# sourceMappingURL=index.js.map