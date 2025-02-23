import Sequelize from 'sequelize'
import mysql2 from 'mysql2';

const sequelize = new Sequelize.Sequelize(
    process.env.DB_NAME || '',
    process.env.DB_USER || '',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || '',
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3307,
        dialectModule: mysql2,
    }
)

sequelize
    .sync({ force: false })
    .then(() => {
        console.log('Database synchronized')
    })
    .catch((error) => {
        console.error('Failed to synchronize database:', error)
    })

export default sequelize
