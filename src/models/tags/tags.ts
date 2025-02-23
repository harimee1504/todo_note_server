import Sequelize from 'sequelize'
import sequelize from '../../utils/db'

const Tags = sequelize.define('tags', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    tag: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    createdBy: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    org_id: {
        type: Sequelize.STRING,
        allowNull: false,
    }
})

export default Tags
