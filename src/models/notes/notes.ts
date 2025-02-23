import Sequelize from 'sequelize'
import sequelize from '../../utils/db'

const Note = sequelize.define('notes', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    note: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    createdBy: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    org_id: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    updatedBy: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    startTime: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    endTime: {
        type: Sequelize.DATE,
        allowNull: true,
    }
})

export default Note
