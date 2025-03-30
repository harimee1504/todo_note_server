import { CustomError, getUsers } from '../../utils/utils'
import Todo from '../../models/todos/todos'
import { validateOrganization } from '../../utils/organization'
export const updateTodoStatus = async (payload: any, context: any) => {
    const transaction = await Todo.sequelize?.transaction()
    try {
        const data = {
            ...payload.input,
            updatedBy: context.req.auth.userId,
            org_id: context.req.auth.orgId
        }
        validateOrganization(context.req, payload.input.orgId);
        let { id: todo_id } = data;

        const [updatedRowsCount] = await Todo.update(data, { 
            where: { id: todo_id, org_id: context.req.auth.orgId },
            transaction
        })

        if (updatedRowsCount === 0) {
            throw new CustomError('Todo not found.')
        } else {
            const todo = await Todo.findByPk(todo_id);
            if (!todo) {
                throw new CustomError('Todo not found after status update.')
            }

            await transaction?.commit()
                
            return {"updated": true};
        }
    } catch (error) {
        await transaction?.rollback()
        console.error(error)
        if (error instanceof CustomError) {
            throw new CustomError(error.message);
        }
        throw new CustomError('Failed to update todo status.')
    }
}