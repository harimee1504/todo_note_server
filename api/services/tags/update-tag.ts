import { CustomError } from '../../utils/utils'

import Tags from '../../models/tags/tags'
import { Op, Sequelize } from 'sequelize'

export const updateTag = async (payload: any, context: any) => {
    const transaction = await Tags.sequelize?.transaction()
    try {
        const data = {
            id: payload.input.id,
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

        const [updatedRowsCount] = await Tags.update(data, { 
            where: {
                id: data.id,
                org_id: context.req.auth.orgId,
            },
            transaction
         })

         if (updatedRowsCount === 0) {
            await transaction?.rollback()
            throw new CustomError('Tag not found.')
        }

        const tag = await Tags.findByPk(data.id, { transaction })

        if (!tag) {
            await transaction?.rollback()
            throw new CustomError('Tag not found after update.')
        }

        const updatedTag = tag.get()

        await transaction?.commit()
        return updatedTag;
    } catch (error) {
        await transaction?.rollback()
        console.error(error)
        if (error instanceof CustomError) {
            throw new CustomError(error.message);
        }
        throw new CustomError('Failed to create tag.')
    }
}
