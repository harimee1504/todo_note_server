import Sequelize from 'sequelize'
import sequelize from '../../utils/db'
import Note from './notes'

const UserNoteAssignement = sequelize.define('user_note_assignment', {
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
    attendee_id: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    org_id: {
        type: Sequelize.STRING,
        allowNull: false,
    }
})

export default UserNoteAssignement
