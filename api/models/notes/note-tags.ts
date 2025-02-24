import Sequelize from 'sequelize'
import sequelize from '../../utils/db'
import Tags from '../tags/tags'
import Note from './notes'

const NoteTags = sequelize.define('note_tags', {
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
        }
    },
    tag_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: Tags,
            key: 'id',
        }
    },
    org_id: {
        type: Sequelize.STRING,
        allowNull: false,
    }
})

NoteTags.belongsTo(Tags, { 
    foreignKey: 'tag_id', 
    as: 'tags', 
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

export default NoteTags
