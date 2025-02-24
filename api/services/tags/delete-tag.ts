
import Tags from "../../models/tags/tags";
import TodoTags from "../../models/todos/todo-tags"
import { CustomError } from "../../utils/utils"

export const deleteTag = async (payload: any, context: any) => {
    const transaction = await Tags.sequelize?.transaction()
    try {
        const deletedRowsCount = await Tags.destroy({ where: { id: payload.input.id, org_id: context.req.auth.orgId } })
        if (deletedRowsCount === 0) {
            throw new CustomError('Tag not found.')
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
        throw new CustomError('Failed to delete tag.')
    }
}