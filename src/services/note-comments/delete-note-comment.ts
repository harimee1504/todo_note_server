import { CustomError } from '../../utils/utils'
import NoteComments from '../../models/notes/note-comments'

export const deleteNoteComment = async (payload: any, context: any) => {
    const transaction = await NoteComments.sequelize?.transaction()
    try {

        const deletedRowsCount = await NoteComments.destroy({ where: { id: payload.input.id, org_id: context.req.auth.orgId }, transaction })
        if (deletedRowsCount === 0) {
            throw new CustomError('Note comment not found.')
        } else {
            await transaction?.commit()
            return {deleted: true}
        }

    } catch (error) {
        console.error(error)
        if (error instanceof CustomError) {
            throw new CustomError(error.message);
        }
        throw new CustomError('Failed to delete note comments.')
    }
}
