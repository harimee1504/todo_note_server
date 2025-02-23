"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTag = void 0;
const utils_1 = require("../../utils/utils");
const tags_1 = __importDefault(require("../../models/tags/tags"));
const sequelize_1 = require("sequelize");
const createTag = (payload, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transaction = yield ((_a = tags_1.default.sequelize) === null || _a === void 0 ? void 0 : _a.transaction());
    try {
        const data = {
            tag: payload.input.tag.trim(),
            createdBy: context.req.auth.userId,
            org_id: context.req.auth.orgId,
        };
        if (!data.tag) {
            throw new utils_1.CustomError('Tag is required.');
        }
        const getTag = yield tags_1.default.findOne({
            where: {
                [sequelize_1.Op.and]: [
                    {
                        org_id: {
                            [sequelize_1.Op.eq]: context.req.auth.orgId,
                        },
                    },
                    sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn('LOWER', sequelize_1.Sequelize.col('tag')), data.tag.toLowerCase()),
                ]
            }
        });
        if (getTag) {
            throw new utils_1.CustomError('Tag already exists.');
        }
        const tag = yield tags_1.default.create(data, { transaction });
        const insertedTag = tag.get();
        yield (transaction === null || transaction === void 0 ? void 0 : transaction.commit());
        return insertedTag;
    }
    catch (error) {
        yield (transaction === null || transaction === void 0 ? void 0 : transaction.rollback());
        console.error(error);
        if (error instanceof utils_1.CustomError) {
            throw new utils_1.CustomError(error.message);
        }
        throw new utils_1.CustomError('Failed to create tag.');
    }
});
exports.createTag = createTag;
