import { createTodo } from '../../services/todos/create-todo'
import { deleteTodo } from '../../services/todos/delete-todo'
import { getTodo } from '../../services/todos/get-todo'
import { updateTodo } from '../../services/todos/update-todo'
import { updateTodoStatus } from '../../services/todos/update-todo-status'
import { withAuthMiddleware } from '../../utils/utils'

const todo = {
    Query: {
        getTodo: withAuthMiddleware('org:todo:read', async (_: any, payload: any, context: any) => getTodo(payload, context)),
    },
    Mutation: {
        createTodo: withAuthMiddleware('org:todo:create', async (_: any, payload: any, context: any) => createTodo(payload, context)),
        updateTodo: withAuthMiddleware('org:todo:update', async (_: any, payload: any, context: any) => updateTodo(payload, context)),        
        updateTodoStatus: withAuthMiddleware('org:todo:update', async (_: any, payload: any, context: any) => updateTodoStatus(payload, context)),        
        deleteTodo: withAuthMiddleware('org:todo:delete', async (_: any, payload: any, context: any) => deleteTodo(payload, context)),
    }
}

export default todo
