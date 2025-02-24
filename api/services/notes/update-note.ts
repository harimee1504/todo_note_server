import Tags from '../../models/tags/tags'
import { CustomError, getUsers } from '../../utils/utils'
import UserNoteAssignement from '../../models/notes/user-note-assignments'
import NoteComments from '../../models/notes/note-comments'
import NoteCommentMentions from '../../models/notes/note-comment-mentions'
import NoteTags from '../../models/notes/note-tags'
import UserNoteMentions from '../../models/notes/user-note-mentions'
import { Note } from '../../models/notes'

export const updateNote = async (payload: any, context: any) => {
    const transaction = await Note.sequelize?.transaction()
    try {
        const data = {
            ...payload.input,
            updatedby: context.req.auth.userId,
            org_id: context.req.auth.orgId
        }
        let { id: note_id , tags = [], attendees, mentions } = data;

        const users = await getUsers(context.req.auth.orgId) as any;;
        
        let userMap : { [key: string]: any } = {};
        const userIds = users.data.map((user: any) => {
            userMap[user.id] = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.emailAddresses[0].emailAddress,
                imageUrl: user.imageUrl
            }
            return user.id
        })

        let attendeeData: { id: string; data: any }[] = []; 
        if(attendees) {
            attendees.map((userId: string) => {
                if (!userIds.includes(userId)) {
                    throw new CustomError(`Invalid attendee ID: ${userId}`);
                }
                attendeeData.push(userMap[userId]);
            })
        }
        
        let mentionsData: { id: string; data: any }[] = []; 
        if(mentions) {
            mentions.map((userId: string) => {
                if (!userIds.includes(userId)) {
                    throw new CustomError(`Invalid mention ID: ${userId}`);
                }
                mentionsData.push(userMap[userId]);
            })
        }

        let tagData: { id: string; tag: any }[] = []; 

        (await Promise.all(tags.map(async (tagId: string) => ({tagId , tagData: await Tags.findByPk(tagId)}))))?.map((tag: any) => {
            if (!tag.tagData) {
                throw new CustomError(`Invalid tag ID: ${tag.tagId}`);
            }
            tagData.push({
                id: tag.tagId,
                tag: tag.tagData.tag
            });
        });

        const [updatedRowsCount] = await Note.update(data, { 
            where: { id: note_id, org_id: context.req.auth.orgId },
            transaction
        })

        if (updatedRowsCount === 0) {
            throw new CustomError('Note not found.')
        } else {
            const note = await Note.findByPk(note_id, {
                include: [
                    {
                        model: UserNoteAssignement,
                        as: 'attendees',
                        attributes: ['attendee_id']
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
                    },
                    {
                        model: UserNoteMentions,
                        as: 'mentions'
                    }
                ], 
                transaction 
            });
            if (!note) {
                throw new CustomError('Note not found after update.')
            }

            const updatedNote = note.get()

            await UserNoteAssignement.destroy({
                where: { note_id: note_id, org_id: context.req.auth.orgId },
                transaction
            })

            await UserNoteMentions.destroy({
                where: { note_id: note_id, org_id: context.req.auth.orgId },
                transaction
            })

            await NoteTags.destroy({
                where: { note_id: note_id, org_id: context.req.auth.orgId },
                transaction
            })


            if (attendees && Array.isArray(attendees) && attendees.length > 0) {
                const noteAssignment = attendees.map((userId: string) => ({
                    note_id: updatedNote.id,
                    attendee_id: userId,
                    org_id: context.req.auth.orgId
                }))
                await UserNoteAssignement.bulkCreate(noteAssignment, { transaction })
            }

            if (mentions && Array.isArray(mentions) && mentions.length > 0) {
                const noteMentions = mentions.map((userId: string) => ({
                    note_id: updatedNote.id,
                    mention_id: userId,
                    org_id: context.req.auth.orgId
                }))
                await UserNoteMentions.bulkCreate(noteMentions, { transaction })
            }

            if (Array.isArray(tags) && tags.length > 0) {
                const noteTags = tags.map((tagId: string) => ({
                    note_id: data.id,
                    tag_id: tagId,
                    org_id: context.req.auth.orgId
                }));
                await NoteTags.bulkCreate(noteTags, { transaction });
            }

            await transaction?.commit()
            const result = {
                ...note.get(),
                createdBy : userMap[note.get().createdBy],
                updatedBy : userMap[note.get().updatedBy],
                attendees: attendeeData,
                tags: tagData,
                mentions: mentionsData,
                comments: (note as any).noteComments?.map((noteComment: any) => ({
                    ...noteComment.get(),
                    mentions: (noteComment as any).noteCommentMentions?.map((noteMention: any) => userMap[noteMention.mention_id]) || []
                }))
            };                
            return result;
        }
    } catch (error) {
        await transaction?.rollback()
        console.error(error)
        if (error instanceof CustomError) {
            throw new CustomError(error.message);
        }
        throw new CustomError('Failed to update note.')
    }
}