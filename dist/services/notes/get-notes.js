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
exports.getNotes = void 0;
const index_1 = require("./index");
const getNotes = (payload, context) => __awaiter(void 0, void 0, void 0, function* () {
    const { by, options = {} } = payload === null || payload === void 0 ? void 0 : payload.input;
    const ENUM = {
        orgId: () => (0, index_1.getFilteredNote)(by, options, context),
        note: () => (0, index_1.getFilteredNote)(by, options, context),
        title: () => (0, index_1.getFilteredNote)(by, options, context),
        createdBy: () => (0, index_1.getFilteredNote)(by, options, context),
        startDate: () => (0, index_1.getFilteredNote)(by, options, context),
        endDate: () => (0, index_1.getFilteredNote)(by, options, context),
        tags: () => (0, index_1.getNoteByTags)(by, options, context),
        mentions: () => (0, index_1.getNoteByMentions)(by, options, context),
        attendees: () => (0, index_1.getNoteByAssignedTo)(by, options, context),
    };
    if (!ENUM[by]) {
        throw new Error('Invalid filter type');
    }
    try {
        const todos = yield ENUM[by]();
        return todos;
    }
    catch (error) {
        console.error('Failed to fetch notes:', error);
        throw new Error('Failed to fetch notes.');
    }
});
exports.getNotes = getNotes;
//# sourceMappingURL=get-notes.js.map