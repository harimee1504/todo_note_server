import Tags from '../../models/tags/tags'
import { CustomError, getUsers } from '../../utils/utils'
import Todo from '../../models/todos/todos'
import TodoTags from '../../models/todos/todo-tags'
import TodoAssignement from '../../models/todos/user-todo-assignments'
import TodoComments from '../../models/todos/todo-comments'
import TodoCommentMentions from '../../models/todos/todo-comment-mentions'
import UserTodoMentions from '../../models/todos/user-todo-mentions'
import { validateOrganization } from '../../utils/organization'

export const updateTodo = async (payload: any, context: any) => {
    const transaction = await Todo.sequelize?.transaction()
    try {
        validateOrganization(context.req, payload.input.orgId);
        const data = {
            ...payload.input,
            updatedBy: context.req.auth.userId,
            org_id: context.req.auth.orgId
        }
        let { id: todo_id , tags, assignedTo, mentions } = data;

        if(data.isPrivate) {
            if(data.assignedTo && data.assignedTo.length > 0) {
                throw new CustomError('Private todos cannot be assigned to users.')
            }
        }

        if (tags?.length > 10) {
            throw new CustomError('A todo can have a maximum of 10 tags.');
        }

        if(data.todo === null || data.todo === undefined || data.todo === '') {
            throw new CustomError('Todo is required');
        }

        if(data.dueDate === null || data.dueDate === undefined || typeof data.dueDate !== 'string') {
            throw new CustomError('Due Date is required');
        }

        let assigneeData: { id: string; data: any }[] = []; 
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
        if(assignedTo) {
            assignedTo.map((userId: string) => {
                if (!userIds.includes(userId)) {
                    throw new CustomError(`Invalid assignee ID: ${userId}`);
                }
                assigneeData.push(userMap[userId]);
            })
        }

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

        const [updatedRowsCount] = await Todo.update(data, { 
            where: { id: todo_id, org_id: context.req.auth.orgId },
            transaction
        })

        if (updatedRowsCount === 0) {
            throw new CustomError('Todo not found.')
        } else {
            const todo = await Todo.findByPk(todo_id, {
                include: [
                    {
                        model: TodoAssignement,
                        as: 'assignees',
                        attributes: ['assignee_id']
                    },
                    {
                        model: TodoComments,
                        as: 'todoComments',
                        include: [
                            {
                                model: TodoCommentMentions,
                                as: 'todoCommentMentions',
                            }
                        ]
                    },
                    {
                        model: TodoTags,
                        as: 'todoTags',
                        include: [
                            {
                                model: Tags,
                                as: 'tags',
                            },
                        ]
                    }
                ], 
                transaction 
            });
            if (!todo) {
                throw new CustomError('Todo not found after update.')
            }

            const updatedTodo = todo.get()

            await TodoAssignement.destroy({
                where: { todo_id: todo_id, org_id: context.req.auth.orgId },
                transaction
            })

            await UserTodoMentions.destroy({
                where: { todo_id: todo_id, org_id: context.req.auth.orgId },
                transaction
            })

            await TodoTags.destroy({
                where: { todo_id: todo_id, org_id: context.req.auth.orgId },
                transaction
            })


            if (assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0) {
                const todoAssignment = assignedTo.map((userId: string) => ({
                    todo_id: updatedTodo.id,
                    assignee_id: userId,
                    org_id: context.req.auth.orgId
                }))
                await TodoAssignement.bulkCreate(todoAssignment, { transaction })
            }

            if (Array.isArray(mentions) && mentions.length > 0) {
                const todoMentions = mentions.map((userId: string) => ({
                    todo_id: updatedTodo.id,
                    mention_id: userId,
                    org_id: context.req.auth.orgId
                }))
                await UserTodoMentions.bulkCreate(todoMentions, { transaction })
            }

            if (Array.isArray(tags) && tags.length > 0) {
                const todoTags = tags.map((tagId: string) => ({
                    todo_id: data.id,
                    tag_id: tagId,
                    org_id: context.req.auth.orgId
                }));
                await TodoTags.bulkCreate(todoTags, { transaction });
            }

            await transaction?.commit()
            const result = {
                ...todo.get(),
                createdBy: userMap[(todo as any).createdBy],
                assignedTo: (todo as any).assignees?.map((assignee: any) => userMap[assignee.assignee_id]) || [],
                tags: (todo as any).todoTags?.map((todoTag: any) => ({id:todoTag.tags.id, tag: todoTag.tags.tag})) || [],
                comments: (todo as any).todoComments?.map((todoComment: any) => ({
                    ...todoComment.get(),
                    mentions: (todoComment as any).todoCommentMentions?.map((todoMention: any) => userMap[todoMention.mention_id]) || []
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
        throw new CustomError('Failed to update todo.')
    }
}