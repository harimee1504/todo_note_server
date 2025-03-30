import { getFilteredTodo, getTodoByAssignedTo, getTodoByMentions, getTodoByTags } from '.';
import { validateOrganization } from '../../utils/organization';

export const getTodo = async (payload: any, context: any) => {
    const { by, options = {} } = payload?.input;
    // Validate organization
    validateOrganization(context.req, options.orgId);

    const ENUM = {
        orgId: () => getFilteredTodo(by, options, context),
        todo: () => getFilteredTodo(by, options, context),
        isPrivate: () => getFilteredTodo(by, options, context),
        description: () => getFilteredTodo(by, options, context),
        status: () => getFilteredTodo(by, options, context),
        createdBy: () => getFilteredTodo(by, options, context),
        dueDate: () => getFilteredTodo(by, options, context),
        dateRange: () => getFilteredTodo(by, options, context),
        tags: () => getTodoByTags(by, options, context),
        mentions: () => getTodoByMentions(by, options, context),
        assignedTo: () => getTodoByAssignedTo(by, options, context),
    }
    if (!ENUM[by as keyof typeof ENUM]) {
        throw new Error('Invalid filter type')
    }
    try {
        const todos = await ENUM[by as keyof typeof ENUM]();
        return todos;
    }
    catch (error) {
        console.error('Failed to fetch todos:', error)
        throw new Error('Failed to fetch todos.')
    }
}