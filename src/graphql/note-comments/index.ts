
import { createNoteComment } from '../../services/note-comments/create-note-comment'
import { deleteNoteComment } from '../../services/note-comments/delete-note-comment'
import { getNoteComments } from '../../services/note-comments/get-note-comments'
import { updateNoteComment } from '../../services/note-comments/update-note-comment'
import { withAuthMiddleware } from '../../utils/utils'

const noteComments = {
    Query: {
        getNoteComments: withAuthMiddleware('org:note:read', async (_: any, payload: any, context: any) => getNoteComments(payload, context)),
    },
    Mutation: {
        createNoteComment: withAuthMiddleware('org:note:create', async (_: any, payload: any, context: any) => createNoteComment(payload, context)),
        updateNoteComment: withAuthMiddleware('org:note:update', async (_: any, payload: any, context: any) => updateNoteComment(payload, context)),        
        deleteNoteComment: withAuthMiddleware('org:note:delete', async (_: any, payload: any, context: any) => deleteNoteComment(payload, context)),
    }
}

export default noteComments