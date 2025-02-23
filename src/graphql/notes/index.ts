import { createNote } from '../../services/notes/create-note'
import { deleteNote } from '../../services/notes/delete-note'
import { getNotes } from '../../services/notes/get-notes'
import { updateNote } from '../../services/notes/update-note'
import { withAuthMiddleware } from '../../utils/utils'

const note = {
    Query: {
        getNotes: withAuthMiddleware('org:note:read', async (_: any, payload: any, context: any) => getNotes(payload, context)),
    },
    Mutation: {
        createNote: withAuthMiddleware('org:note:create', async (_: any, payload: any, context: any) => createNote(payload, context)),
        updateNote: withAuthMiddleware('org:note:update', async (_: any, payload: any, context: any) => updateNote(payload, context)),        
        deleteNote: withAuthMiddleware('org:note:delete', async (_: any, payload: any, context: any) => deleteNote(payload, context)),
    }
}

export default note
