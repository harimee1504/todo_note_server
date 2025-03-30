import { CustomError, getUsers } from '../../utils/utils'

import Tags from '../../models/tags/tags'
import UserNoteAssignement from '../../models/notes/user-note-assignments'
import NoteTags from '../../models/notes/note-tags'
import UserNoteMentions from '../../models/notes/user-note-mentions'
import { Note } from '../../models/notes'

export const createNote = async (payload: any, context: any) => {
    const transaction = await Note.sequelize?.transaction()
    try {
        const data = {
            ...payload.input,
            createdBy: context.req.auth.userId,
            updatedBy: context.req.auth.userId,
            org_id: context.req.auth.orgId,
        }
        const { tags = [], attendees = [], mentions = [] } = payload.input

        if (tags.length > 10) {
            throw new CustomError('A note can have a maximum of 10 tags.');
        }

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

        let attendeesData: { id: string; data: any }[] = [];
        attendees.map((userId: string) => {
            if (!userIds.includes(userId)) {
                throw new CustomError(`Invalid attendee ID: ${userId}`);
            }
            attendeesData.push(userMap[userId]);
        })

        let mentionData: { id: string; data: any }[] = [];
        mentions.map((userId: string) => {
            if (!userIds.includes(userId)) {
                throw new CustomError(`Invalid mention ID: ${userId}`);
            }
            mentionData.push(userMap[userId]);
        })

        let tagData: { id: string; tag: any }[] = [];

        (await Promise.all(tags.map(async (tagId: string) => ({tagId , tagData: await Tags.findByPk(tagId)})))).map((tag: any) => {
            if (!tag.tagData) {
                throw new CustomError(`Invalid tag ID: ${tag.tagId}`);
            }
            tagData.push({
                id: tag.tagId,
                tag: tag.tagData.tag
            });
        });

        const note = await Note.create(data, { transaction })
        const insertedNote = note.get()

        if (Array.isArray(attendees) && attendees.length > 0) {
            const noteAssignment = attendees.map((userId: string) => ({
                note_id: insertedNote.id,
                attendee_id: userId,
                org_id: context.req.auth.orgId
            }))
            await UserNoteAssignement.bulkCreate(noteAssignment, { transaction })
        }
        if (Array.isArray(mentions) && mentions.length > 0) {
            const noteMentions = mentions.map((userId: string) => ({
                note_id: insertedNote.id,
                mention_id: userId,
                org_id: context.req.auth.orgId
            }))
            await UserNoteMentions.bulkCreate(noteMentions, { transaction })
        }
        if (Array.isArray(tags) && tags.length > 0) {
            const noteTags = tags.map((tagId: string) => ({
                note_id: insertedNote.id,
                tag_id: tagId,
                org_id: context.req.auth.orgId
            }));
            await NoteTags.bulkCreate(noteTags, { transaction });
        }
        await transaction?.commit()
        return {...insertedNote, createdBy: userMap[insertedNote.createdBy], updatedBy: userMap[insertedNote.updatedBy],  attendees: attendeesData, tags:tagData, mentions: mentionData};
    } catch (error) {
        await transaction?.rollback()
        console.error(error)
        if (error instanceof CustomError) {
            throw new CustomError(error.message);
        }
        throw new CustomError('Failed to create note.')
    }
}
