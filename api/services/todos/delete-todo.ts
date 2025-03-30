
import Todo from "../../models/todos/todos"
import { CustomError } from "../../utils/utils"
import { validateOrganization } from "../../utils/organization"
export const deleteTodo = async (payload: any, context: any) => {
    const transaction = await Todo.sequelize?.transaction()
    try {
        validateOrganization(context.req, payload.input.orgId);
        const deletedRowsCount = await Todo.destroy({ where: { id: payload.input.id, org_id: context.req.auth.orgId }, transaction })
        if (deletedRowsCount === 0) {
            throw new CustomError('Todo not found.')
        } else {
            await transaction?.commit()
            return {deleted: true}
        }
    } catch (error) {
        await transaction?.rollback()
        if (error instanceof CustomError) {
            throw new CustomError(error.message);
        }
        console.error(error)
        throw new CustomError('Failed to delete todo.')
    }
}