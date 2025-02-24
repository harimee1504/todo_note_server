import { CustomError, getUsers } from '../../utils/utils'
import TodoComments from '../../models/todos/todo-comments'
import TodoCommentMentions from '../../models/todos/todo-comment-mentions'

export const updateTodoComment = async (payload: any, context: any) => {
    const transaction = await TodoComments.sequelize?.transaction()
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

        const [updatedRowsCount] = await TodoComments.update(data, { 
            where: { id: comment_id, org_id: context.req.auth.orgId },
            transaction
        })

        if (updatedRowsCount === 0) {
            throw new CustomError('Todo comment not found.');
        } else {
            const todoComment = await TodoComments.findOne({
                where: { id: comment_id, org_id: context.req.auth.orgId },
                include: [
                    {
                        model: TodoCommentMentions,
                        as: 'todoCommentMentions',
                    }
                ],
                transaction
            })

            if (!todoComment) {
                throw new CustomError('Failed to retrieve updated todo comment.');
            }

            const updateTodoComment = todoComment.get()

            await TodoCommentMentions.destroy({ 
                where: { comment_id: comment_id, org_id: context.req.auth.orgId },
                transaction 
            })

            if (Array.isArray(mentions) && mentions.length > 0) {
                const todoCommentMentions = mentions.map((userId: string) => ({
                    comment_id: comment_id,
                    mention_id: userId,
                    org_id: context.req.auth.orgId
                }))
                await TodoCommentMentions.bulkCreate(todoCommentMentions, { transaction })
            }

            await transaction?.commit()

            return {
                ...updateTodoComment,
                createdBy: userMap[updateTodoComment.createdBy],
                updatedBy: userMap[updateTodoComment.updatedBy],
                mentions: mentionsData
            }

        }

    } catch (error) {
        console.error(error)
        if (error instanceof CustomError) {
            throw new CustomError(error.message);
        }
        throw new CustomError('Failed to update todo comments.')
    }
}
