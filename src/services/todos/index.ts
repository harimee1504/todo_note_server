import { Op, Sequelize } from 'sequelize'

import Tags from '../../models/tags/tags';
import Todo from '../../models/todos/todos';
import TodoAssignement from '../../models/todos/user-todo-assignments';
import TodoTags from '../../models/todos/todo-tags';
import TodoCommentMentions from '../../models/todos/todo-comment-mentions';
import UserTodoMentions from '../../models/todos/user-todo-mentions';

import { CustomError, getUsers } from '../../utils/utils';
import TodoComments from '../../models/todos/todo-comments';

export const getFilterQuery = (by: string, options: any, context: any) => {
    const ENUM = {
        isPrivate: () =>  ({
            isPrivate: {
                [Op.eq]: options.isPrivate,
            }
        }),
        todo: () =>  ({
            todo: {
                [Op.like]: `%${options.todo}%`,
            }
        }),
        description: () =>  ({
            description: {
                [Op.like]: `%${options.description}%`,
            }
        }),
        status: () =>  ({
            status: {
                [Op.eq]: options.status,
            }
        }),
        createdBy: () =>  ({
            createdBy: {
                [Op.eq]: options.createdBy,
            }
        }),
        dueDate: () =>  ({
            [Op.and]: [
                {
                    status: {
                        [Op.ne]: 'completed',
                    },
                },
                {
                    dueDate: {
                        [Op.eq]: options.dueDate,
                    },
                },
            ],
        }),
        dateRange: () =>  ({
            [Op.and]: [
                {
                    status: {
                        [Op.ne]: 'completed',
                    },
                },
                {
                    dueDate: {
                        [Op.between]: [options.startDate, options.endDate],
                    },
                },
            ],
        })
    }        
    
    return ENUM[by as keyof typeof ENUM] || (() => ({}));
}


export const getFilteredTodo = async(by: string, options: any, context: any) => {
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
    const todos = await Todo.findAll({
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
                                (SELECT todo_id FROM user_todo_assignments WHERE assignee_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id : Sequelize.literal(`
                                (SELECT todo_id FROM user_todo_mentions WHERE mention_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id : Sequelize.literal(`
                                (SELECT todo_id FROM todo_comments WHERE comment_id IN (select comment_id from todo_comment_mentions where mention_id = '${context.req.auth.userId}'))
                            `)
                        }
                    ],
                },
                by !== "status" ? {
                    status: {
                        [Op.ne]: 'completed',
                    },
                } : {},
                query
            ]
        },
        include: [
            {
                model: TodoAssignement,
                as: 'assignees',
                attributes: ['assignee_id']
            },
            {
                model: UserTodoMentions,
                as: 'mentions',
                attributes: ['mention_id']
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
        ]
    });

    const result = todos.map(todo => ({
        ...todo.get(),
        createdBy: userMap[(todo as any).createdBy],
        updatedBy: userMap[(todo as any).updatedBy],
        assignedTo: (todo as any).assignees?.map((assignee: any) => userMap[assignee.assignee_id]) || [],
        mentions: (todo as any).mentions?.map((mention: any) => userMap[mention.mention_id]) || [],
        tags: (todo as any).todoTags?.map((todoTag: any) => ({id:todoTag.tags.id, tag: todoTag.tags.tag})) || [],
        comments: (todo as any).todoComments?.map((todoComment: any) => ({
            ...todoComment.get(),
            createdBy: userMap[(todoComment as any).createdBy],
            updatedBy: userMap[(todoComment as any).updatedBy],
            mentions: (todoComment as any).todoCommentMentions?.map((todoMention: any) => userMap[todoMention.mention_id]) || []
        }))
    }));           

    return result;
}
export const getTodoByTags = async(_: string, options: any, context: any) => {
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

    const todos = await Todo.findAll({
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
                                (SELECT todo_id FROM todo_assignments WHERE assignee_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id : Sequelize.literal(`
                                (SELECT todo_id FROM todomentions WHERE mention_id = '${context.req.auth.userId}')
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
                model: TodoAssignement,
                as: 'assignees',
                attributes: ['assignee_id'],
            },
            {
                model: TodoTags,
                as: 'todoTags',
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
                model: UserTodoMentions,
                as: 'mentions',
                attributes: ['mention_id'],
            }
        ]
    });

    const result = todos.map(todo => ({
        ...todo.get(),
        createdBy: userMap[(todo as any).createdBy],
        updatedBy: userMap[(todo as any).updatedBy],
        assignedTo: (todo as any).assignees?.map((assignee: any) => assignee.assignee_id) || [],
        mentions: (todo as any).mentions?.map((mention: any) => mention.mention_id) || [],
        tags: (todo as any).todoTags?.map((todoTag: any) => todoTag.tags.tag) || [],
    }));           
 
    return result;
}

export const getTodoByAssignedTo = async(_: string, options: any, context: any) => {
    const { assignedTo: assignees = [] } = options;
    if (assignees.length === 0) {
        throw new CustomError('At least one assignee must be provided.');
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

    const todos = await Todo.findAll({
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
                                (SELECT todo_id FROM user_todo_assignments WHERE assignee_id = '${context.req.auth.userId}')
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
                model: TodoAssignement,
                as: 'assignees',
                attributes: ['assignee_id']
            },
            {
                model: UserTodoMentions,
                as: 'mentions',
                attributes: ['mention_id']
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
        ]
    });

    const result = todos.map(todo => ({
        ...todo.get(),
        createdBy: userMap[(todo as any).createdBy],
        updatedBy: userMap[(todo as any).updatedBy],
        assignedTo: (todo as any).assignees?.map((assignee: any) => userMap[assignee.assignee_id]) || [],
        mentions: (todo as any).mentions?.map((mention: any) => userMap[mention.mention_id]) || [],
        tags: (todo as any).todoTags?.map((todoTag: any) => ({id:todoTag.tags.id, tag: todoTag.tags.tag})) || [],
        comments: (todo as any).todoComments?.map((todoComment: any) => ({
            ...todoComment.get(),
            createdBy: userMap[(todoComment as any).createdBy],
            updatedBy: userMap[(todoComment as any).updatedBy],
            mentions: (todoComment as any).todoCommentMentions?.map((todoMention: any) => userMap[todoMention.mention_id]) || []
        }))
    }));           
 
    return result;
}

export const getTodoByMentions = async(_: string, options: any, context: any) => {
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

    const todos = await Todo.findAll({
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
                                (SELECT todo_id FROM todo_assignments WHERE assignee_id = '${context.req.auth.userId}')
                            `)
                        },
                        {
                            id : Sequelize.literal(`
                                (SELECT todo_id FROM todomentions WHERE mention_id = '${context.req.auth.userId}')
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
                model: TodoAssignement,
                as: 'assignees',
                attributes: ['assignee_id']
            },
            {
                model: TodoTags,
                as: 'todoTags',
                include: [
                    {
                        model: Tags,
                        as: 'tags',
                    },
                ],
            },
            {
                model: UserTodoMentions,
                as: 'mentions',
                attributes: ['mention_id'],
                where: {
                    mention_id: {
                        [Op.in]: mentions,
                    },
                }
            }
        ]
    });

    const result = todos.map(todo => ({
        ...todo.get(),
        createdBy: userMap[(todo as any).createdBy],
        updatedBy: userMap[(todo as any).updatedBy],
        assignedTo: (todo as any).assignees?.map((assignee: any) => assignee.assignee_id) || [],
        mentions: (todo as any).mentions?.map((mention: any) => mention.mention_id) || [],
        tags: (todo as any).todoTags?.map((todoTag: any) => todoTag.tags.tag) || [],
    }));           
 
    return result;
}