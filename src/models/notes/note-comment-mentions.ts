import Sequelize from 'sequelize'
import sequelize from '../../utils/db'
import NoteComments from './note-comments'

const NoteCommentMentions = sequelize.define('note_comment_mentions', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    comment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: NoteComments,
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

export default NoteCommentMentions
