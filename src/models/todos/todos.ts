import Sequelize from 'sequelize'
import UserTodoAssignement from './user-todo-assignments'
import TodoTags from './todo-tags'
import sequelize from '../../utils/db'
import TodoComments from './todo-comments'
import UserTodoMentions from './user-todo-mentions'

const Todos = sequelize.define('todos', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    todo: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
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
    isPrivate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    dueDate: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    status: {
        type: Sequelize.ENUM('notStarted', 'active', 'onHold', 'completed', 'overdue'),
        allowNull: false,
        defaultValue: 'notStarted',
    },
})

Todos.hasMany(UserTodoAssignement, {
    foreignKey: 'todo_id',
    as: 'assignees',
})

Todos.hasMany(UserTodoMentions, {
    foreignKey: 'todo_id',
    as: 'mentions',
})

Todos.hasMany(TodoComments, {
    foreignKey: 'todo_id',
    as: 'todoComments',
})

Todos.hasMany(TodoTags, {
    foreignKey: 'todo_id',
    as: 'todoTags',
    onDelete: 'CASCADE',
})

export default Todos
