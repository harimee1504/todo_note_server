import { createTag } from '../../services/tags/create-tag'
import { deleteTag } from '../../services/tags/delete-tag'
import { getTags } from '../../services/tags/get-tags'
import { updateTag } from '../../services/tags/update-tag'
import { withAuthMiddleware } from '../../utils/utils'

const todo = {
    Query: {
        getTags: withAuthMiddleware('org:todo:read', async (_: any, __: any, context: any) => getTags(context)),
    },
    Mutation: {
        createTag: withAuthMiddleware('org:todo:create', async (_: any, payload: any, context: any) => createTag(payload, context)),
        updateTag: withAuthMiddleware('org:todo:update', async (_: any, payload: any, context: any) => updateTag(payload, context)),        
        deleteTag: withAuthMiddleware('org:todo:delete', async (_: any, payload: any, context: any) => deleteTag(payload, context)),
    }
}

export default todo