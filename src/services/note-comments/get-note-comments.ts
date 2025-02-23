import { CustomError } from '../../utils/utils'

export const getNoteComments = async (payload: any, context: any) => {
    try {

    } catch (error) {
        console.error(error)
        if (error instanceof CustomError) {
            throw new CustomError(error.message);
        }
        throw new CustomError('Failed to get todo comments.')
    }
}
