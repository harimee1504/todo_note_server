import { CustomError, getUsers } from '../../utils/utils'

import Tags from '../../models/tags/tags'
import Todo from '../../models/todos/todos'
import TodoTags from '../../models/todos/todo-tags'
import TodoAssignement from '../../models/todos/user-todo-assignments'
import TodoMentions from '../../models/todos/user-todo-mentions'

export const createTodo = async (payload: any, context: any) => {
    const transaction = await Todo.sequelize?.transaction()
    try {
        const data = {
            ...payload.input,
            createdBy: context.req.auth.userId,
            updatedBy: context.req.auth.userId,
            org_id: context.req.auth.orgId,
        }
        const { tags = [], assignedTo = [], mentions = [] } = payload.input

        if(data.isPrivate) {
            if(data.assignedTo && data.assignedTo.length > 0) {
                throw new CustomError('Private todos cannot be assigned to users.')
            }
        }

        if (tags.length > 10) {
            throw new CustomError('A todo can have a maximum of 10 tags.');
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


        let assigneeData: { id: string; data: any }[] = []; 
        assignedTo.map((userId: string) => {
            if (!userIds.includes(userId)) {
                throw new CustomError(`Invalid assignee ID: ${userId}`);
            }
            assigneeData.push(userMap[userId]);
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

        const todo = await Todo.create(data, { transaction })
        const insertedTodo = todo.get()

        if (Array.isArray(assignedTo) && assignedTo.length > 0) {
            const todoAssignment = assignedTo.map((userId: string) => ({
                todo_id: insertedTodo.id,
                assignee_id: userId,
                org_id: context.req.auth.orgId
            }))
            await TodoAssignement.bulkCreate(todoAssignment, { transaction })
        }
        if (Array.isArray(mentions) && mentions.length > 0) {
            const todoMentions = mentions.map((userId: string) => ({
                todo_id: insertedTodo.id,
                mention_id: userId,
                org_id: context.req.auth.orgId
            }))
            await TodoMentions.bulkCreate(todoMentions, { transaction })
        }
        if (Array.isArray(tags) && tags.length > 0) {
            const todoTags = tags.map((tagId: string) => ({
                todo_id: insertedTodo.id,
                tag_id: tagId,
                org_id: context.req.auth.orgId
            }));
            await TodoTags.bulkCreate(todoTags, { transaction });
        }
        await transaction?.commit()
        return {...insertedTodo, createdBy: userMap[insertedTodo.createdBy], updatedBy: userMap[insertedTodo.updatedBy], assignedTo: assigneeData, tags:tagData};
    } catch (error) {
        await transaction?.rollback()
        console.error(error)
        if (error instanceof CustomError) {
            throw new CustomError(error.message);
        }
        throw new CustomError('Failed to create todo.')
    }
}
