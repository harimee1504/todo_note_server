import Sequelize from 'sequelize'
import sequelize from '../../utils/db'
import Todo from './todos'
import Tags from '../tags/tags'

const TodoTags = sequelize.define('todo_tags', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    todo_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: Todo,
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

TodoTags.belongsTo(Tags, { 
    foreignKey: 'tag_id', 
    as: 'tags', 
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

export default TodoTags
