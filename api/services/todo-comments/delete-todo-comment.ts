import { CustomError } from '../../utils/utils'
import TodoComments from '../../models/todos/todo-comments'

export const deleteTodoComment = async (payload: any, context: any) => {
    const transaction = await TodoComments.sequelize?.transaction()
    try {

        const deletedRowsCount = await TodoComments.destroy({ where: { id: payload.input.id, org_id: context.req.auth.orgId }, transaction })
        if (deletedRowsCount === 0) {
            throw new CustomError('Todo comment not found.')
        } else {
            await transaction?.commit()
            return {deleted: true}
        }

    } catch (error) {
        console.error(error)
        if (error instanceof CustomError) {
            throw new CustomError(error.message);
        }
        throw new CustomError('Failed to delete todo comments.')
    }
}
