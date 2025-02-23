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
exports.updateNoteComment = void 0;
const utils_1 = require("../../utils/utils");
const note_comments_1 = __importDefault(require("../../models/notes/note-comments"));
const note_comment_mentions_1 = __importDefault(require("../../models/notes/note-comment-mentions"));
const updateNoteComment = (payload, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transaction = yield ((_a = note_comments_1.default.sequelize) === null || _a === void 0 ? void 0 : _a.transaction());
    try {
        const data = Object.assign(Object.assign({}, payload.input), { updatedBy: context.req.auth.userId, org_id: context.req.auth.orgId });
        let mentionsData = [];
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
        let { id: comment_id, mentions } = data;
        if (mentions) {
            mentions.map((userId) => {
                if (!userIds.includes(userId)) {
                    throw new utils_1.CustomError(`Invalid mention ID: ${userId}`);
                }
                mentionsData.push(userMap[userId]);
            });
        }
        const [updatedRowsCount] = yield note_comments_1.default.update(data, {
            where: { id: comment_id, org_id: context.req.auth.orgId },
            transaction
        });
        if (updatedRowsCount === 0) {
            throw new utils_1.CustomError('Note comment not found.');
        }
        else {
            const noteComment = yield note_comments_1.default.findOne({
                where: { id: comment_id, org_id: context.req.auth.orgId },
                include: [
                    {
                        model: note_comment_mentions_1.default,
                        as: 'noteCommentMentions',
                    }
                ],
                transaction
            });
            if (!noteComment) {
                throw new utils_1.CustomError('Failed to retrieve updated note comment.');
            }
            const updateNoteComment = noteComment.get();
            yield note_comment_mentions_1.default.destroy({
                where: { comment_id: comment_id, org_id: context.req.auth.orgId },
                transaction
            });
            if (Array.isArray(mentions) && mentions.length > 0) {
                const noteCommentMentions = mentions.map((userId) => ({
                    comment_id: comment_id,
                    mention_id: userId,
                    org_id: context.req.auth.orgId
                }));
                yield note_comment_mentions_1.default.bulkCreate(noteCommentMentions, { transaction });
            }
            yield (transaction === null || transaction === void 0 ? void 0 : transaction.commit());
            return Object.assign(Object.assign({}, updateNoteComment), { createdBy: userMap[updateNoteComment.createdBy], updatedBy: userMap[updateNoteComment.updatedBy], mentions: mentionsData });
        }
    }
    catch (error) {
        console.error(error);
        if (error instanceof utils_1.CustomError) {
            throw new utils_1.CustomError(error.message);
        }
        throw new utils_1.CustomError('Failed to update note comments.');
    }
});
exports.updateNoteComment = updateNoteComment;
//# sourceMappingURL=update-note-comment.js.map