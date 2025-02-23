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
exports.getNoteByMentions = exports.getNoteByAssignedTo = exports.getNoteByTags = exports.getFilteredNote = exports.getFilterQuery = void 0;
const sequelize_1 = require("sequelize");
const tags_1 = __importDefault(require("../../models/tags/tags"));
const utils_1 = require("../../utils/utils");
const user_note_assignments_1 = __importDefault(require("../../models/notes/user-note-assignments"));
const note_comments_1 = __importDefault(require("../../models/notes/note-comments"));
const note_comment_mentions_1 = __importDefault(require("../../models/notes/note-comment-mentions"));
const note_tags_1 = __importDefault(require("../../models/notes/note-tags"));
const user_note_mentions_1 = __importDefault(require("../../models/notes/user-note-mentions"));
const notes_1 = require("../../models/notes");
const getFilterQuery = (by, options, context) => {
    const ENUM = {
        note: () => ({
            note: {
                [sequelize_1.Op.like]: `%${options.note}%`,
            }
        }),
        title: () => ({
            title: {
                [sequelize_1.Op.like]: `%${options.title}%`,
            }
        }),
        createdBy: () => ({
            createdBy: {
                [sequelize_1.Op.eq]: options.createdBy,
            }
        }),
        startTime: () => ({
            [sequelize_1.Op.and]: [
                {
                    startTime: {
                        [sequelize_1.Op.eq]: options.startTime,
                    },
                },
            ],
        }),
        endTime: () => ({
            [sequelize_1.Op.and]: [
                {
                    endTime: {
                        [sequelize_1.Op.eq]: options.endTime,
                    },
                },
            ],
        }),
        dateRange: () => ({
            [sequelize_1.Op.and]: [
                {
                    startDate: {
                        [sequelize_1.Op.gte]: options.startTime
                    },
                },
                {
                    endDate: {
                        [sequelize_1.Op.lte]: options.endTime
                    },
                },
            ],
        })
    };
    return ENUM[by] || (() => ({}));
};
exports.getFilterQuery = getFilterQuery;
const getFilteredNote = (by, options, context) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield (0, utils_1.getUsers)(context.req.auth.orgId);
    ;
    let userMap = {};
    users.data.map((user) => {
        userMap[user.id] = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses[0].emailAddress,
            imageUrl: user.imageUrl
        };
    });
    let query = (0, exports.getFilterQuery)(by, options, context)();
    const notes = yield notes_1.Note.findAll({
        where: {
            [sequelize_1.Op.and]: [
                {
                    org_id: context.req.auth.orgId,
                },
                {
                    [sequelize_1.Op.or]: [
                        { createdBy: context.req.auth.userId },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT note_id FROM user_note_assignments WHERE attendee_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT note_id FROM user_note_mentions WHERE mention_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT note_id FROM note_comments WHERE comment_id IN (select comment_id from note_comment_mentions where mention_id = '${context.req.auth.userId}'))
                            `)
                        }
                    ],
                },
                query
            ]
        },
        include: [
            {
                model: user_note_assignments_1.default,
                as: 'attendees',
                attributes: ['attendee_id']
            },
            {
                model: user_note_mentions_1.default,
                as: 'mentions',
                attributes: ['mention_id']
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
            }
        ]
    });
    const result = notes.map(note => {
        var _a, _b, _c, _d;
        return (Object.assign(Object.assign({}, note.get()), { createdBy: userMap[note.createdBy], updatedBy: userMap[note.updatedBy], attendees: ((_a = note.attendees) === null || _a === void 0 ? void 0 : _a.map((attendee) => userMap[attendee.attendee_id])) || [], mentions: ((_b = note.mentions) === null || _b === void 0 ? void 0 : _b.map((mention) => userMap[mention.mention_id])) || [], tags: ((_c = note.noteTags) === null || _c === void 0 ? void 0 : _c.map((noteTag) => ({ id: noteTag.tags.id, tag: noteTag.tags.tag }))) || [], comments: (_d = note.noteComments) === null || _d === void 0 ? void 0 : _d.map((noteComment) => {
                var _a;
                return (Object.assign(Object.assign({}, noteComment.get()), { createdBy: userMap[noteComment.createdBy], updatedBy: userMap[noteComment.updatedBy], mentions: ((_a = noteComment.noteCommentMentions) === null || _a === void 0 ? void 0 : _a.map((noteMention) => userMap[noteMention.mention_id])) || [] }));
            }) }));
    });
    return result;
});
exports.getFilteredNote = getFilteredNote;
const getNoteByTags = (_, options, context) => __awaiter(void 0, void 0, void 0, function* () {
    const { tags = [] } = options;
    if (tags.length === 0) {
        throw new utils_1.CustomError('At least one tag must be provided.');
    }
    const users = yield (0, utils_1.getUsers)(context.req.auth.orgId);
    ;
    let userMap = {};
    users.data.map((user) => {
        userMap[user.id] = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses[0].emailAddress,
            imageUrl: user.imageUrl
        };
    });
    const tagRecords = yield tags_1.default.findAll({
        where: {
            [sequelize_1.Op.and]: [
                {
                    org_id: {
                        [sequelize_1.Op.eq]: context.req.auth.orgId,
                    },
                },
                {
                    tag: {
                        [sequelize_1.Op.in]: tags,
                    }
                }
            ]
        },
        attributes: ['id'],
    });
    if (tagRecords.length === 0) {
        return [];
    }
    const tagIds = tagRecords.map((tag) => tag.get('id'));
    const notes = yield notes_1.Note.findAll({
        where: {
            [sequelize_1.Op.and]: [
                {
                    org_id: {
                        [sequelize_1.Op.eq]: context.req.auth.orgId,
                    },
                },
                {
                    [sequelize_1.Op.or]: [
                        { createdBy: context.req.auth.userId },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT note_id FROM note_assignments WHERE attendee_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT note_id FROM notementions WHERE mention_id = '${context.req.auth.userId}')
                            `)
                        }
                    ],
                },
                {
                    status: {
                        [sequelize_1.Op.ne]: 'completed',
                    },
                }
            ]
        },
        include: [
            {
                model: user_note_assignments_1.default,
                as: 'attendees',
                attributes: ['attendee_id'],
            },
            {
                model: note_tags_1.default,
                as: 'noteTags',
                include: [
                    {
                        model: tags_1.default,
                        as: 'tags',
                    },
                ],
                where: {
                    tag_id: {
                        [sequelize_1.Op.in]: tagIds,
                    },
                }
            },
            {
                model: note_comment_mentions_1.default,
                as: 'noteMentions',
                attributes: ['mention_id'],
            }
        ]
    });
    const result = notes.map(note => {
        var _a, _b, _c;
        return (Object.assign(Object.assign({}, note.get()), { createdBy: userMap[note.get().createdBy], updatedBy: userMap[note.get().updatedBy], attendees: ((_a = note.attendees) === null || _a === void 0 ? void 0 : _a.map((attendee) => attendee.attendee_id)) || [], mentions: ((_b = note.mentions) === null || _b === void 0 ? void 0 : _b.map((mention) => mention.mention_id)) || [], tags: ((_c = note.noteTags) === null || _c === void 0 ? void 0 : _c.map((noteTag) => noteTag.tags.tag)) || [] }));
    });
    return result;
});
exports.getNoteByTags = getNoteByTags;
const getNoteByAssignedTo = (_, options, context) => __awaiter(void 0, void 0, void 0, function* () {
    const { assignedTo: attendees = [] } = options;
    if (attendees.length === 0) {
        throw new utils_1.CustomError('At least one attendee must be provided.');
    }
    const users = yield (0, utils_1.getUsers)(context.req.auth.orgId);
    ;
    let userMap = {};
    users.data.map((user) => {
        userMap[user.id] = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses[0].emailAddress,
            imageUrl: user.imageUrl
        };
    });
    const notes = yield notes_1.Note.findAll({
        where: {
            [sequelize_1.Op.and]: [
                {
                    org_id: {
                        [sequelize_1.Op.eq]: context.req.auth.orgId,
                    },
                },
                {
                    [sequelize_1.Op.or]: [
                        { createdBy: context.req.auth.userId },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT note_id FROM note_assignments WHERE attendee_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT note_id FROM notementions WHERE mention_id = '${context.req.auth.userId}')
                            `)
                        }
                    ],
                },
                {
                    status: {
                        [sequelize_1.Op.ne]: 'completed',
                    },
                }
            ]
        },
        include: [
            {
                model: user_note_assignments_1.default,
                as: 'attendees',
                attributes: ['attendee_id'],
                where: {
                    attendee_id: {
                        [sequelize_1.Op.in]: attendees,
                    },
                }
            },
            {
                model: note_tags_1.default,
                as: 'noteTags',
                include: [
                    {
                        model: tags_1.default,
                        as: 'tags',
                    },
                ],
            },
            {
                model: note_comment_mentions_1.default,
                as: 'noteMentions',
                attributes: ['mention_id'],
            }
        ]
    });
    const result = notes.map(note => {
        var _a, _b, _c;
        return (Object.assign(Object.assign({}, note.get()), { createdBy: userMap[note.get().createdBy], updatedBy: userMap[note.get().updatedBy], assignedTo: ((_a = note.attendees) === null || _a === void 0 ? void 0 : _a.map((attendee) => attendee.attendee_id)) || [], mentions: ((_b = note.mentions) === null || _b === void 0 ? void 0 : _b.map((mention) => mention.mention_id)) || [], tags: ((_c = note.noteTags) === null || _c === void 0 ? void 0 : _c.map((noteTag) => noteTag.tags.tag)) || [] }));
    });
    return result;
});
exports.getNoteByAssignedTo = getNoteByAssignedTo;
const getNoteByMentions = (_, options, context) => __awaiter(void 0, void 0, void 0, function* () {
    const { mentions = [] } = options;
    if (mentions.length === 0) {
        throw new utils_1.CustomError('At least one mention must be provided.');
    }
    const users = yield (0, utils_1.getUsers)(context.req.auth.orgId);
    ;
    let userMap = {};
    users.data.map((user) => {
        userMap[user.id] = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses[0].emailAddress,
            imageUrl: user.imageUrl
        };
    });
    const notes = yield notes_1.Note.findAll({
        where: {
            [sequelize_1.Op.and]: [
                {
                    org_id: {
                        [sequelize_1.Op.eq]: context.req.auth.orgId,
                    },
                },
                {
                    [sequelize_1.Op.or]: [
                        { createdBy: context.req.auth.userId },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT note_id FROM note_assignments WHERE attendee_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id: sequelize_1.Sequelize.literal(`
                                (SELECT note_id FROM notementions WHERE mention_id = '${context.req.auth.userId}')
                            `)
                        }
                    ],
                },
                {
                    status: {
                        [sequelize_1.Op.ne]: 'completed',
                    },
                }
            ]
        },
        include: [
            {
                model: user_note_assignments_1.default,
                as: 'attendees',
                attributes: ['attendee_id']
            },
            {
                model: note_tags_1.default,
                as: 'noteTags',
                include: [
                    {
                        model: tags_1.default,
                        as: 'tags',
                    },
                ],
            },
            {
                model: note_comment_mentions_1.default,
                as: 'noteMentions',
                attributes: ['mention_id'],
                where: {
                    mention_id: {
                        [sequelize_1.Op.in]: mentions,
                    },
                }
            }
        ]
    });
    const result = notes.map(note => {
        var _a, _b, _c;
        return (Object.assign(Object.assign({}, note.get()), { createdBy: userMap[note.get().createdBy], updatedBy: userMap[note.get().updatedBy], assignedTo: ((_a = note.attendees) === null || _a === void 0 ? void 0 : _a.map((attendee) => attendee.attendee_id)) || [], mentions: ((_b = note.mentions) === null || _b === void 0 ? void 0 : _b.map((mention) => mention.mention_id)) || [], tags: ((_c = note.noteTags) === null || _c === void 0 ? void 0 : _c.map((noteTag) => noteTag.tags.tag)) || [] }));
    });
    return result;
});
exports.getNoteByMentions = getNoteByMentions;
//# sourceMappingURL=index.js.map