import Sequelize from 'sequelize'
import sequelize from '../../utils/db'
import Note from './notes'

const UserNoteMentions = sequelize.define('user_note_mentions', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    note_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: Note,
            key: 'id',
        },
    },
    mention_id: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    org_id: {
        type: Sequelize.STRING,
        allowNull: false,
    }
})

export default UserNoteMentions
