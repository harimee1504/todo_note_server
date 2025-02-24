import Tags from "../../models/tags/tags";

export const getTags = async (context: any) => {
    const tags = await Tags.findAll({ where: { org_id: context.req.auth.orgId } });
    return tags
}