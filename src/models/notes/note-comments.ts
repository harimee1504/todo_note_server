import Sequelize from 'sequelize'
import sequelize from '../../utils/db'
import Note from './notes'
import NoteCommentMentions from './note-comment-mentions'

const NoteComments = sequelize.define('note_comments', {
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
            key: 'id'
        }
    },
    comment: {
        type: Sequelize.STRING,
        allowNull: false,
    },     
    createdBy: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    updatedBy: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    org_id: {
        type: Sequelize.STRING,
        allowNull: false,
    }
})

NoteComments.hasMany(NoteCommentMentions, {
    foreignKey: 'comment_id',
    as: 'noteCommentMentions',
})

export default NoteComments