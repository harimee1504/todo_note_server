import { getNoteByMentions , getNoteByAssignedTo, getNoteByTags, getFilteredNote } from "./index";

export const getNotes = async (payload: any, context: any) => {
    const { by, options = {} } = payload?.input;
    const ENUM = {
        orgId: () => getFilteredNote(by, options, context),
        note: () => getFilteredNote(by, options, context),
        title: () => getFilteredNote(by, options, context),
        createdBy: () => getFilteredNote(by, options, context),
        startDate: () => getFilteredNote(by, options, context),
        endDate: () => getFilteredNote(by, options, context),
        tags: () => getNoteByTags(by, options, context),
        mentions: () => getNoteByMentions(by, options, context),
        attendees: () => getNoteByAssignedTo(by, options, context),
    }
    if (!ENUM[by as keyof typeof ENUM]) {
        throw new Error('Invalid filter type')
    }
    try {
        const todos = await ENUM[by as keyof typeof ENUM]();
        return todos;
    }
    catch (error) {
        console.error('Failed to fetch notes:', error)
        throw new Error('Failed to fetch notes.')
    }
}