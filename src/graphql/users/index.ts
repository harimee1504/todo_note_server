import { getUsers } from "../../utils/utils";

const user = {
    Query: {
        getUsersByOrg: async (_: any, __: any, context: any) => {
            try {
                const users = await getUsers(context.req.auth.orgId) as any;
                const userData = users.data.map((user: any) => {
                    return {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.emailAddresses[0].emailAddress,
                        imageUrl: user.imageUrl
                    }
                })
                return userData
            }
            catch (error) {
                console.error('Failed to fetch users:', error)
                throw new Error('Failed to fetch users.')
            }
        }
    }
}

export default user