"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const db_1 = __importDefault(require("../../utils/db"));
const Note = db_1.default.define('notes', {
    id: {
        type: sequelize_1.default.UUID,
        defaultValue: sequelize_1.default.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    note: {
        type: sequelize_1.default.TEXT,
        allowNull: false,
    },
    createdBy: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    org_id: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    updatedBy: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    startTime: {
        type: sequelize_1.default.DATE,
        allowNull: true,
    },
    endTime: {
        type: sequelize_1.default.DATE,
        allowNull: true,
    }
});
exports.default = Note;
