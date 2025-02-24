import Sequelize from 'sequelize'
import sequelize from '../../utils/db'
import TodoComments from './todo-comments'

const TodoCommentMentions = sequelize.define('todo_comment_mentions', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    comment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: TodoComments,
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

export default TodoCommentMentions
