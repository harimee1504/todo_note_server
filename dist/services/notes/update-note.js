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
exports.updateNote = void 0;
const tags_1 = __importDefault(require("../../models/tags/tags"));
const utils_1 = require("../../utils/utils");
const user_note_assignments_1 = __importDefault(require("../../models/notes/user-note-assignments"));
const note_comments_1 = __importDefault(require("../../models/notes/note-comments"));
const note_comment_mentions_1 = __importDefault(require("../../models/notes/note-comment-mentions"));
const note_tags_1 = __importDefault(require("../../models/notes/note-tags"));
const user_note_mentions_1 = __importDefault(require("../../models/notes/user-note-mentions"));
const notes_1 = require("../../models/notes");
const updateNote = (payload, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const transaction = yield ((_a = notes_1.Note.sequelize) === null || _a === void 0 ? void 0 : _a.transaction());
    try {
        const data = Object.assign(Object.assign({}, payload.input), { updatedby: context.req.auth.userId, org_id: context.req.auth.orgId });
        let { id: note_id, tags = [], attendees, mentions } = data;
        const users = yield (0, utils_1.getUsers)(context.req.auth.orgId);
        ;
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
        let attendeeData = [];
        if (attendees) {
            attendees.map((userId) => {
                if (!userIds.includes(userId)) {
                    throw new utils_1.CustomError(`Invalid attendee ID: ${userId}`);
                }
                attendeeData.push(userMap[userId]);
            });
        }
        let mentionsData = [];
        if (mentions) {
            mentions.map((userId) => {
                if (!userIds.includes(userId)) {
                    throw new utils_1.CustomError(`Invalid mention ID: ${userId}`);
                }
                mentionsData.push(userMap[userId]);
            });
        }
        let tagData = [];
        (_b = (yield Promise.all(tags.map((tagId) => __awaiter(void 0, void 0, void 0, function* () { return ({ tagId, tagData: yield tags_1.default.findByPk(tagId) }); }))))) === null || _b === void 0 ? void 0 : _b.map((tag) => {
            if (!tag.tagData) {
                throw new utils_1.CustomError(`Invalid tag ID: ${tag.tagId}`);
            }
            tagData.push({
                id: tag.tagId,
                tag: tag.tagData.tag
            });
        });
        const [updatedRowsCount] = yield notes_1.Note.update(data, {
            where: { id: note_id, org_id: context.req.auth.orgId },
            transaction
        });
        if (updatedRowsCount === 0) {
            throw new utils_1.CustomError('Note not found.');
        }
        else {
            const note = yield notes_1.Note.findByPk(note_id, {
                include: [
                    {
                        model: user_note_assignments_1.default,
                        as: 'attendees',
                        attributes: ['attendee_id']
                    },
                    {
                        model: note_comments_1.default,
                        as: 'noteComments',
                        include: [
                            {
                                model: note_comment_mentions_1.default,
                                as: 'noteCommentMentions',
                            }
                        ]
                    },
                    {
                        model: note_tags_1.default,
                        as: 'noteTags',
                        include: [
                            {
                                model: tags_1.default,
                                as: 'tags',
                            },
                        ]
                    },
                    {
                        model: user_note_mentions_1.default,
                        as: 'mentions'
                    }
                ],
                transaction
            });
            if (!note) {
                throw new utils_1.CustomError('Note not found after update.');
            }
            const updatedNote = note.get();
            yield user_note_assignments_1.default.destroy({
                where: { note_id: note_id, org_id: context.req.auth.orgId },
                transaction
            });
            yield user_note_mentions_1.default.destroy({
                where: { note_id: note_id, org_id: context.req.auth.orgId },
                transaction
            });
            yield note_tags_1.default.destroy({
                where: { note_id: note_id, org_id: context.req.auth.orgId },
                transaction
            });
            if (attendees && Array.isArray(attendees) && attendees.length > 0) {
                const noteAssignment = attendees.map((userId) => ({
                    note_id: updatedNote.id,
                    attendee_id: userId,
                    org_id: context.req.auth.orgId
                }));
                yield user_note_assignments_1.default.bulkCreate(noteAssignment, { transaction });
            }
            if (mentions && Array.isArray(mentions) && mentions.length > 0) {
                const noteMentions = mentions.map((userId) => ({
                    note_id: updatedNote.id,
                    mention_id: userId,
                    org_id: context.req.auth.orgId
                }));
                yield user_note_mentions_1.default.bulkCreate(noteMentions, { transaction });
            }
            if (Array.isArray(tags) && tags.length > 0) {
                const noteTags = tags.map((tagId) => ({
                    note_id: data.id,
                    tag_id: tagId,
                    org_id: context.req.auth.orgId
                }));
                yield note_tags_1.default.bulkCreate(noteTags, { transaction });
            }
            yield (transaction === null || transaction === void 0 ? void 0 : transaction.commit());
            const result = Object.assign(Object.assign({}, note.get()), { createdBy: userMap[note.get().createdBy], updatedBy: userMap[note.get().updatedBy], attendees: attendeeData, tags: tagData, mentions: mentionsData, comments: (_c = note.noteComments) === null || _c === void 0 ? void 0 : _c.map((noteComment) => {
                    var _a;
                    return (Object.assign(Object.assign({}, noteComment.get()), { mentions: ((_a = noteComment.noteCommentMentions) === null || _a === void 0 ? void 0 : _a.map((noteMention) => userMap[noteMention.mention_id])) || [] }));
                }) });
            return result;
        }
    }
    catch (error) {
        yield (transaction === null || transaction === void 0 ? void 0 : transaction.rollback());
        console.error(error);
        if (error instanceof utils_1.CustomError) {
            throw new utils_1.CustomError(error.message);
        }
        throw new utils_1.CustomError('Failed to update note.');
    }
});
exports.updateNote = updateNote;
