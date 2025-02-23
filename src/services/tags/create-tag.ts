import { CustomError } from '../../utils/utils'

import Tags from '../../models/tags/tags'
import { Op, Sequelize } from 'sequelize'

export const createTag = async (payload: any, context: any) => {
    const transaction = await Tags.sequelize?.transaction()
    try {
        const data = {
            tag: payload.input.tag.trim(),
            createdBy: context.req.auth.userId,
            org_id: context.req.auth.orgId,
        }

        if (!data.tag) {
            throw new CustomError('Tag is required.')
        }

        const getTag = await Tags.findOne({
            where: {
                [Op.and]: [
                    {
                        org_id: {
                            [Op.eq]: context.req.auth.orgId,
                        },
                    },
                    Sequelize.where(
                        Sequelize.fn('LOWER', Sequelize.col('tag')),
                        data.tag.toLowerCase()
                    ),
                ]
            }
        })

        if (getTag) {
            throw new CustomError('Tag already exists.')
        }

        const tag = await Tags.create(data, { transaction })
        const insertedTag = tag.get()

        await transaction?.commit()
        return insertedTag;
    } catch (error) {
        await transaction?.rollback()
        console.error(error)
        if (error instanceof CustomError) {
            throw new CustomError(error.message);
        }
        throw new CustomError('Failed to create tag.')
    }
}
