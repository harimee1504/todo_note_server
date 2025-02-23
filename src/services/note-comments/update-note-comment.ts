
import { CustomError, getUsers } from '../../utils/utils'
import NoteComments from '../../models/notes/note-comments'
import NoteCommentMentions from '../../models/notes/note-comment-mentions'

export const updateNoteComment = async (payload: any, context: any) => {
    const transaction = await NoteComments.sequelize?.transaction()
    try {

        const data = {
            ...payload.input,
            updatedBy: context.req.auth.userId,
            org_id: context.req.auth.orgId,
        }

        let mentionsData: { id: string; data: any }[] = []; 

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

        let { id: comment_id , mentions } = data;

        if(mentions) {
            mentions.map((userId: string) => {
                if (!userIds.includes(userId)) {
                    throw new CustomError(`Invalid mention ID: ${userId}`);
                }
                mentionsData.push(userMap[userId]);
            })
        }

        const [updatedRowsCount] = await NoteComments.update(data, { 
            where: { id: comment_id, org_id: context.req.auth.orgId },
            transaction
        })

        if (updatedRowsCount === 0) {
            throw new CustomError('Note comment not found.');
        } else {
            const noteComment = await NoteComments.findOne({
                where: { id: comment_id, org_id: context.req.auth.orgId },
                include: [
                    {
                        model: NoteCommentMentions,
                        as: 'noteCommentMentions',
                    }
                ],
                transaction
            })

            if (!noteComment) {
                throw new CustomError('Failed to retrieve updated note comment.');
            }

            const updateNoteComment = noteComment.get()

            await NoteCommentMentions.destroy({ 
                where: { comment_id: comment_id, org_id: context.req.auth.orgId },
                transaction 
            })

            if (Array.isArray(mentions) && mentions.length > 0) {
                const noteCommentMentions = mentions.map((userId: string) => ({
                    comment_id: comment_id,
                    mention_id: userId,
                    org_id: context.req.auth.orgId
                }))
                await NoteCommentMentions.bulkCreate(noteCommentMentions, { transaction })
            }

            await transaction?.commit()

            return {
                ...updateNoteComment,
                createdBy: userMap[updateNoteComment.createdBy],
                updatedBy: userMap[updateNoteComment.updatedBy],
                mentions: mentionsData
            }

        }

    } catch (error) {
        console.error(error)
        if (error instanceof CustomError) {
            throw new CustomError(error.message);
        }
        throw new CustomError('Failed to update note comments.')
    }
}
