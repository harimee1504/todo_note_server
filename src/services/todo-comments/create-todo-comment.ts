import { CustomError, getUsers } from '../../utils/utils'
import Todos from '../../models/todos/todos'
import TodoComments from '../../models/todos/todo-comments'
import TodoCommentMentions from '../../models/todos/todo-comment-mentions'

export const createTodoComment = async (payload: any, context: any) => {
    const transaction = await TodoComments.sequelize?.transaction()
    try {
        const data = {
            ...payload.input,
            createdby: context.req.auth.userId,
            updatedBy: context.req.auth.userId,
            org_id: context.req.auth.orgId,
        };

        const { mentions = [] } = payload.input;

        const todo = await Todos.findByPk(data.todo_id);
        if (!todo) {
            throw new CustomError('Todo not found.');
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

        let mentionsData: { id: string; data: any }[] = []; 
        mentions.map((userId: string) => {
            if (!userIds.includes(userId)) {
                throw new CustomError(`Invalid mention ID: ${userId}`);
            }
            mentionsData.push(userMap[userId]);
        })

        const todoComment = await TodoComments.create(data, { transaction });
        const insertedTodoComment = todoComment.get();

        if (!insertedTodoComment) {
            throw new CustomError('Failed to create todo comment.');
        }

        if (Array.isArray(mentions) && mentions.length > 0) {
            const todoCommentMentions = mentions.map((userId: string) => ({
                comment_id: insertedTodoComment.id,
                mention_id: userId,
                org_id: context.req.auth.orgId
            }))
            await TodoCommentMentions.bulkCreate(todoCommentMentions, { transaction })
        }

        await transaction?.commit();

        return {...insertedTodoComment, createdBy: userMap[insertedTodoComment.createdby], updatedBy: userMap[insertedTodoComment.updatedby],  mentions: mentionsData, todo_id: data.todo_id};

    } catch (error) {
        await transaction?.rollback()
        console.error(error)
        if (error instanceof CustomError) {
            throw new CustomError(error.message);
        }
        throw new CustomError('Failed to create todo comments.')
    }
}
