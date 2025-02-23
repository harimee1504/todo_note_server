import Sequelize from 'sequelize'
import sequelize from '../../utils/db'
import Todos from './todos'
import TodoCommentMentions from './todo-comment-mentions'

const TodoComments = sequelize.define('todo_comments', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    todo_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: Todos,
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

TodoComments.hasMany(TodoCommentMentions, {
    foreignKey: 'comment_id',
    as: 'todoCommentMentions',
})

export default TodoComments