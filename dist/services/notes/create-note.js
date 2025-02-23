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
exports.createNote = void 0;
const utils_1 = require("../../utils/utils");
const tags_1 = __importDefault(require("../../models/tags/tags"));
const user_note_assignments_1 = __importDefault(require("../../models/notes/user-note-assignments"));
const note_tags_1 = __importDefault(require("../../models/notes/note-tags"));
const user_note_mentions_1 = __importDefault(require("../../models/notes/user-note-mentions"));
const notes_1 = require("../../models/notes");
const createNote = (payload, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transaction = yield ((_a = notes_1.Note.sequelize) === null || _a === void 0 ? void 0 : _a.transaction());
    try {
        const data = Object.assign(Object.assign({}, payload.input), { createdBy: context.req.auth.userId, updatedBy: context.req.auth.userId, org_id: context.req.auth.orgId });
        const { tags = [], attendees = [], mentions = [] } = payload.input;
        if (tags.length > 10) {
            throw new utils_1.CustomError('A note can have a maximum of 10 tags.');
        }
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
        let attendeesData = [];
        attendees.map((userId) => {
            if (!userIds.includes(userId)) {
                throw new utils_1.CustomError(`Invalid attendee ID: ${userId}`);
            }
            attendeesData.push(userMap[userId]);
        });
        let mentionData = [];
        mentions.map((userId) => {
            if (!userIds.includes(userId)) {
                throw new utils_1.CustomError(`Invalid mention ID: ${userId}`);
            }
            mentionData.push(userMap[userId]);
        });
        let tagData = [];
        (yield Promise.all(tags.map((tagId) => __awaiter(void 0, void 0, void 0, function* () { return ({ tagId, tagData: yield tags_1.default.findByPk(tagId) }); })))).map((tag) => {
            if (!tag.tagData) {
                throw new utils_1.CustomError(`Invalid tag ID: ${tag.tagId}`);
            }
            tagData.push({
                id: tag.tagId,
                tag: tag.tagData.tag
            });
        });
        const note = yield notes_1.Note.create(data, { transaction });
        const insertedNote = note.get();
        if (Array.isArray(attendees) && attendees.length > 0) {
            const noteAssignment = attendees.map((userId) => ({
                note_id: insertedNote.id,
                attendee_id: userId,
                org_id: context.req.auth.orgId
            }));
            yield user_note_assignments_1.default.bulkCreate(noteAssignment, { transaction });
        }
        if (Array.isArray(mentions) && mentions.length > 0) {
            const noteMentions = mentions.map((userId) => ({
                note_id: insertedNote.id,
                mention_id: userId,
                org_id: context.req.auth.orgId
            }));
            yield user_note_mentions_1.default.bulkCreate(noteMentions, { transaction });
        }
        if (Array.isArray(tags) && tags.length > 0) {
            const noteTags = tags.map((tagId) => ({
                note_id: insertedNote.id,
                tag_id: tagId,
                org_id: context.req.auth.orgId
            }));
            yield note_tags_1.default.bulkCreate(noteTags, { transaction });
        }
        yield (transaction === null || transaction === void 0 ? void 0 : transaction.commit());
        console.log(Object.assign(Object.assign({}, insertedNote), { createdBy: userMap[insertedNote.createdBy], updatedBy: userMap[insertedNote.updatedBy], attendees: attendeesData, tags: tagData, mentions: mentionData }));
        return Object.assign(Object.assign({}, insertedNote), { createdBy: userMap[insertedNote.createdBy], updatedBy: userMap[insertedNote.updatedBy], attendees: attendeesData, tags: tagData, mentions: mentionData });
    }
    catch (error) {
        yield (transaction === null || transaction === void 0 ? void 0 : transaction.rollback());
        console.error(error);
        if (error instanceof utils_1.CustomError) {
            throw new utils_1.CustomError(error.message);
        }
        throw new utils_1.CustomError('Failed to create note.');
    }
});
exports.createNote = createNote;
