import { createTodoComment } from '../../services/todo-comments/create-todo-comment'
import { deleteTodoComment } from '../../services/todo-comments/delete-todo-comment'
import { getTodoComments } from '../../services/todo-comments/get-todo-comments'
import { updateTodoComment } from '../../services/todo-comments/update-todo-comment'
import { withAuthMiddleware } from '../../utils/utils'

const todoComments = {
    Query: {
        getTodoComments: withAuthMiddleware('org:todo:read', async (_: any, payload: any, context: any) => getTodoComments(payload, context)),
    },
    Mutation: {
        createTodoComment: withAuthMiddleware('org:todo:create', async (_: any, payload: any, context: any) => createTodoComment(payload, context)),
        updateTodoComment: withAuthMiddleware('org:todo:update', async (_: any, payload: any, context: any) => updateTodoComment(payload, context)),        
        deleteTodoComment: withAuthMiddleware('org:todo:delete', async (_: any, payload: any, context: any) => deleteTodoComment(payload, context)),
    }
}

export default todoComments