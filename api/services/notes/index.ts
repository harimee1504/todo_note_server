import { Op, Sequelize } from 'sequelize'

import Tags from '../../models/tags/tags';
import { CustomError, getUsers } from '../../utils/utils';
import UserNoteAssignement from '../../models/notes/user-note-assignments';
import NoteComments from '../../models/notes/note-comments';
import NoteCommentMentions from '../../models/notes/note-comment-mentions';
import NoteTags from '../../models/notes/note-tags';
import UserNoteMentions from '../../models/notes/user-note-mentions';
import { Note } from '../../models/notes';

export const getFilterQuery = (by: string, options: any, context: any) => {
    const ENUM = {
        note: () =>  ({
            note: {
                [Op.like]: `%${options.note}%`,
            }
        }),
        title: () =>  ({
            title: {
                [Op.like]: `%${options.title}%`,
            }
        }),
        createdBy: () =>  ({
            createdBy: {
                [Op.eq]: options.createdBy,
            }
        }),
        startTime: () =>  ({
            [Op.and]: [
                {
                    startTime: {
                        [Op.eq]: options.startTime,
                    },
                },
            ],
        }),
        endTime: () =>  ({
            [Op.and]: [
                {
                    endTime: {
                        [Op.eq]: options.endTime,
                    },
                },
            ],
        }),
        dateRange: () =>  ({
            [Op.and]: [
                {
                    startDate: {
                        [Op.gte]: options.startTime
                    },
                },
                {
                    endDate: {
                        [Op.lte]: options.endTime
                    },
                },
            ],
        })
    }        
    
    return ENUM[by as keyof typeof ENUM] || (() => ({}));
}


export const getFilteredNote = async(by: string, options: any, context: any) => {
    const users = await getUsers(context.req.auth.orgId) as any;;

    let userMap : { [key: string]: any } = {};
    users.data.map((user: any) => {
        userMap[user.id] = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses[0].emailAddress,
            imageUrl: user.imageUrl
        }
    })

    let query = getFilterQuery(by, options, context)();
    const notes = await Note.findAll({
        where: {
            [Op.and]: [
                {
                    org_id: context.req.auth.orgId,
                },
                {
                    [Op.or]: [
                        { createdBy : context.req.auth.userId },
                        {
                            id : Sequelize.literal(`
                                (SELECT note_id FROM user_note_assignments WHERE attendee_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id : Sequelize.literal(`
                                (SELECT note_id FROM user_note_mentions WHERE mention_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id : Sequelize.literal(`
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
                model: UserNoteAssignement,
                as: 'attendees',
                attributes: ['attendee_id']
            },
            {
                model: UserNoteMentions,
                as: 'mentions',
                attributes: ['mention_id']
            },
            {
                model: NoteComments,
                as: 'noteComments',
                include: [
                    {
                        model: NoteCommentMentions,
                        as: 'noteCommentMentions',
                    }
                ]
            },
            {
                model: NoteTags,
                as: 'noteTags',
                include: [
                    {
                        model: Tags,
                        as: 'tags',
                    },
                ]
            }
        ]
    });

    const result = notes.map(note => ({
        ...note.get(),
        createdBy: userMap[(note as any).createdBy],
        updatedBy: userMap[(note as any).updatedBy],
        attendees: (note as any).attendees?.map((attendee: any) => userMap[attendee.attendee_id]) || [],
        mentions: (note as any).mentions?.map((mention: any) => userMap[mention.mention_id]) || [],
        tags: (note as any).noteTags?.map((noteTag: any) => ({id:noteTag.tags.id, tag: noteTag.tags.tag})) || [],
        comments: (note as any).noteComments?.map((noteComment: any) => ({
            ...noteComment.get(),
            createdBy: userMap[(noteComment as any).createdBy],
            updatedBy: userMap[(noteComment as any).updatedBy],
            mentions: (noteComment as any).noteCommentMentions?.map((noteMention: any) => userMap[noteMention.mention_id]) || []
        }))
    }));           
 
    return result;
}
export const getNoteByTags = async(_: string, options: any, context: any) => {
    const { tags = [] } = options;
    if (tags.length === 0) {
        throw new CustomError('At least one tag must be provided.');
    }

    const users = await getUsers(context.req.auth.orgId) as any;;

    let userMap : { [key: string]: any } = {};
    users.data.map((user: any) => {
        userMap[user.id] = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses[0].emailAddress,
            imageUrl: user.imageUrl
        }
    })

    const tagRecords = await Tags.findAll({
        where: {
            [Op.and]: [
                {
                    org_id: {
                        [Op.eq]: context.req.auth.orgId,
                    },
                },
                {
                    tag: {
                        [Op.in]: tags,
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

    const notes = await Note.findAll({
        where: {
            [Op.and]: [
                {
                    org_id: {
                        [Op.eq]: context.req.auth.orgId,
                    },
                },
                {
                    [Op.or]: [
                        { createdBy : context.req.auth.userId },
                        {
                            id : Sequelize.literal(`
                                (SELECT note_id FROM note_assignments WHERE attendee_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id : Sequelize.literal(`
                                (SELECT note_id FROM notementions WHERE mention_id = '${context.req.auth.userId}')
                            `)
                        }
                    ],
                },
                {
                    status: {
                        [Op.ne]: 'completed',
                    },
                }
            ]
        },
        include: [
            {
                model: UserNoteAssignement,
                as: 'attendees',
                attributes: ['attendee_id'],
            },
            {
                model: NoteTags,
                as: 'noteTags',
                include: [
                    {
                        model: Tags,
                        as: 'tags',
                    },
                ],
                where: {
                    tag_id: {
                        [Op.in]: tagIds,
                    },
                }
            },
            {
                model: NoteCommentMentions,
                as: 'noteMentions',
                attributes: ['mention_id'],
            }
        ]
    });

    const result = notes.map(note => ({
        ...note.get(),
        createdBy : userMap[note.get().createdBy],
        updatedBy : userMap[note.get().updatedBy],
        attendees: (note as any).attendees?.map((attendee: any) => attendee.attendee_id) || [],
        mentions: (note as any).mentions?.map((mention: any) => mention.mention_id) || [],
        tags: (note as any).noteTags?.map((noteTag: any) => noteTag.tags.tag) || [],
    }));           
 
    return result;
}

export const getNoteByAssignedTo = async(_: string, options: any, context: any) => {
    const { assignedTo: attendees = [] } = options;
    if (attendees.length === 0) {
        throw new CustomError('At least one attendee must be provided.');
    }

    const users = await getUsers(context.req.auth.orgId) as any;;

    let userMap : { [key: string]: any } = {};
    users.data.map((user: any) => {
        userMap[user.id] = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses[0].emailAddress,
            imageUrl: user.imageUrl
        }
    })

    const notes = await Note.findAll({
        where: {
            [Op.and]: [
                {
                    org_id: {
                        [Op.eq]: context.req.auth.orgId,
                    },
                },
                {
                    [Op.or]: [
                        { createdBy : context.req.auth.userId },
                        {
                            id : Sequelize.literal(`
                                (SELECT note_id FROM note_assignments WHERE attendee_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id : Sequelize.literal(`
                                (SELECT note_id FROM notementions WHERE mention_id = '${context.req.auth.userId}')
                            `)
                        }
                    ],
                },
                {
                    status: {
                        [Op.ne]: 'completed',
                    },
                }
            ]
        },
        include: [
            {
                model: UserNoteAssignement,
                as: 'attendees',
                attributes: ['attendee_id'],
                where: {
                    attendee_id: {
                        [Op.in]: attendees,
                    },
                }
            },
            {
                model: NoteTags,
                as: 'noteTags',
                include: [
                    {
                        model: Tags,
                        as: 'tags',
                    },
                ],
            },
            {
                model: NoteCommentMentions,
                as: 'noteMentions',
                attributes: ['mention_id'],
            }
        ]
    });

    const result = notes.map(note => ({
        ...note.get(),
        createdBy : userMap[note.get().createdBy],
        updatedBy : userMap[note.get().updatedBy],
        assignedTo: (note as any).attendees?.map((attendee: any) => attendee.attendee_id) || [],
        mentions: (note as any).mentions?.map((mention: any) => mention.mention_id) || [],
        tags: (note as any).noteTags?.map((noteTag: any) => noteTag.tags.tag) || [],
    }));           
 
    return result;
}

export const getNoteByMentions = async(_: string, options: any, context: any) => {
    const { mentions = [] } = options;
    if (mentions.length === 0) {
        throw new CustomError('At least one mention must be provided.');
    }

    const users = await getUsers(context.req.auth.orgId) as any;;

    let userMap : { [key: string]: any } = {};
    users.data.map((user: any) => {
        userMap[user.id] = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses[0].emailAddress,
            imageUrl: user.imageUrl
        }
    })

    const notes = await Note.findAll({
        where: {
            [Op.and]: [
                {
                    org_id: {
                        [Op.eq]: context.req.auth.orgId,
                    },
                },
                {
                    [Op.or]: [
                        { createdBy : context.req.auth.userId },
                        {
                            id : Sequelize.literal(`
                                (SELECT note_id FROM note_assignments WHERE attendee_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id : Sequelize.literal(`
                                (SELECT note_id FROM notementions WHERE mention_id = '${context.req.auth.userId}')
                            `)
                        }
                    ],
                },
                {
                    status: {
                        [Op.ne]: 'completed',
                    },
                }
            ]
        },
        include: [
            {
                model: UserNoteAssignement,
                as: 'attendees',
                attributes: ['attendee_id']
            },
            {
                model: NoteTags,
                as: 'noteTags',
                include: [
                    {
                        model: Tags,
                        as: 'tags',
                    },
                ],
            },
            {
                model: NoteCommentMentions,
                as: 'noteMentions',
                attributes: ['mention_id'],
                where: {
                    mention_id: {
                        [Op.in]: mentions,
                    },
                }
            }
        ]
    });

    const result = notes.map(note => ({
        ...note.get(),
        createdBy : userMap[note.get().createdBy],
        updatedBy : userMap[note.get().updatedBy],
        assignedTo: (note as any).attendees?.map((attendee: any) => attendee.attendee_id) || [],
        mentions: (note as any).mentions?.map((mention: any) => mention.mention_id) || [],
        tags: (note as any).noteTags?.map((noteTag: any) => noteTag.tags.tag) || [],
    }));           
 
    return result;
}