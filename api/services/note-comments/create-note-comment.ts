import { CustomError, getUsers } from '../../utils/utils'
import NoteComments from '../../models/notes/note-comments';
import NoteTags from '../../models/notes/note-tags';
import NoteCommentMentions from '../../models/notes/note-comment-mentions';
import { Note } from '../../models/notes';

export const createNoteComment = async (payload: any, context: any) => {
    const transaction = await NoteComments.sequelize?.transaction()
    try {
        const data = {
            ...payload.input,
            createdBy: context.req.auth.userId,
            updatedBy: context.req.auth.userId,
            org_id: context.req.auth.orgId,
        };

        const { mentions = [] } = payload.input;

        const note = await Note.findByPk(data.note_id);
        if (!note) {
            throw new CustomError('Note not found.');
        }

        const users = await getUsers(context.req.auth.orgId) as any;

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

        let mentionsData: { id: string; data: any }[] = []; 
        mentions.map((userId: string) => {
            if (!userIds.includes(userId)) {
                throw new CustomError(`Invalid mention ID: ${userId}`);
            }
            mentionsData.push(userMap[userId]);
        })

        const noteComment = await NoteComments.create(data, { transaction });
        const insertedNoteComment = noteComment.get();

        if (!insertedNoteComment) {
            throw new CustomError('Failed to create note comment.');
        }

        if (Array.isArray(mentions) && mentions.length > 0) {
            const noteCommentMentions = mentions.map((userId: string) => ({
                comment_id: insertedNoteComment.id,
                mention_id: userId,
                org_id: context.req.auth.orgId
            }))
            await NoteCommentMentions.bulkCreate(noteCommentMentions, { transaction })
        }

        await transaction?.commit();

        return {...insertedNoteComment, createdBy: userMap[insertedNoteComment.createdBy], updatedBy: userMap[insertedNoteComment.updatedBy], mentions: mentionsData, note_id: data.note_id};

    } catch (error) {
        await transaction?.rollback()
        console.error(error)
        if (error instanceof CustomError) {
            throw new CustomError(error.message);
        }
        throw new CustomError('Failed to create note comments.')
    }
}
