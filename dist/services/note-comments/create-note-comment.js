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
exports.createNoteComment = void 0;
const utils_1 = require("../../utils/utils");
const note_comments_1 = __importDefault(require("../../models/notes/note-comments"));
const note_comment_mentions_1 = __importDefault(require("../../models/notes/note-comment-mentions"));
const notes_1 = require("../../models/notes");
const createNoteComment = (payload, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transaction = yield ((_a = note_comments_1.default.sequelize) === null || _a === void 0 ? void 0 : _a.transaction());
    try {
        const data = Object.assign(Object.assign({}, payload.input), { createdBy: context.req.auth.userId, updatedBy: context.req.auth.userId, org_id: context.req.auth.orgId });
        const { mentions = [] } = payload.input;
        const note = yield notes_1.Note.findByPk(data.note_id);
        if (!note) {
            throw new utils_1.CustomError('Note not found.');
        }
        const users = yield (0, utils_1.getUsers)(context.req.auth.orgId);
        let userMap = {};
        const userIds = users.data.map((user) => {
            userMap[user.id] = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.emailAddresses[0].emailAddress,
                imageUrl: user.imageUrl
            };
            return user.id;
        });
        let mentionsData = [];
        mentions.map((userId) => {
            if (!userIds.includes(userId)) {
                throw new utils_1.CustomError(`Invalid mention ID: ${userId}`);
            }
            mentionsData.push(userMap[userId]);
        });
        const noteComment = yield note_comments_1.default.create(data, { transaction });
        const insertedNoteComment = noteComment.get();
        if (!insertedNoteComment) {
            throw new utils_1.CustomError('Failed to create note comment.');
        }
        if (Array.isArray(mentions) && mentions.length > 0) {
            const noteCommentMentions = mentions.map((userId) => ({
                comment_id: insertedNoteComment.id,
                mention_id: userId,
                org_id: context.req.auth.orgId
            }));
            yield note_comment_mentions_1.default.bulkCreate(noteCommentMentions, { transaction });
        }
        yield (transaction === null || transaction === void 0 ? void 0 : transaction.commit());
        return Object.assign(Object.assign({}, insertedNoteComment), { createdBy: userMap[insertedNoteComment.createdBy], updatedBy: userMap[insertedNoteComment.updatedBy], mentions: mentionsData, note_id: data.note_id });
    }
    catch (error) {
        yield (transaction === null || transaction === void 0 ? void 0 : transaction.rollback());
        console.error(error);
        if (error instanceof utils_1.CustomError) {
            throw new utils_1.CustomError(error.message);
        }
        throw new utils_1.CustomError('Failed to create note comments.');
    }
});
exports.createNoteComment = createNoteComment;
