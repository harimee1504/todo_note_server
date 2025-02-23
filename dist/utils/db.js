"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const sequelize = new sequelize_1.default.Sequelize(process.env.DB_NAME || '', process.env.DB_USER || '', process.env.DB_PASSWORD || '', {
    host: process.env.DB_HOST || '',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3307,
    dialect: 'mysql',
});
sequelize
    .sync({ force: false })
    .then(() => {
    console.log('Database synchronized');
})
    .catch((error) => {
    console.error('Failed to synchronize database:', error);
});
exports.default = sequelize;
//# sourceMappingURL=db.js.map