import Sequelize from 'sequelize'
import sequelize from '../../utils/db'
import Todos from './todos'

const UserTodoAssignement = sequelize.define('user_todo_assignment', {
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
            key: 'id',
        },
    },
    assignee_id: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    org_id: {
        type: Sequelize.STRING,
        allowNull: false,
    }
})

export default UserTodoAssignement
