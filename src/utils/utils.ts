import { getAuth} from '@clerk/express'
import {cache} from '../server'
import { clerkClient } from '@clerk/express'

const withPermission = (context: any, permission: string) => {
    const { req } = context
    const auth = getAuth(req)
    if (!auth || !auth.userId) {
        throw new Error('Unauthorized Access')
    } else if (!auth.has({ permission })) {
        throw new Error('User does not have permission or Forbidden!')
    }
    return (fn: (auth: any) => any) => fn(auth)
}

export const withAuthMiddleware = (permission: string, resolver: Function) => {
    return (_: any, args: any, context: any) => {
        const withPerm = withPermission(context, permission)

        if (withPerm) {
            return withPerm(() => resolver(_, args, context))
        }
    }
}

export class CustomError extends Error {
    constructor(message: string | undefined) {
      super(message);
      this.name = "CustomError";
    }
}


export const getUsers = async(org_id: any) => {
    const cacheKey = `users-${org_id}`;

    const cachedUsers = cache.get(cacheKey);
    if (cachedUsers) {
        return cachedUsers;
    }

    const usersList = await clerkClient.users.getUserList({
        organizationId: org_id,
        limit: 10,
    })

    cache.set(cacheKey, usersList);

    return usersList;
};