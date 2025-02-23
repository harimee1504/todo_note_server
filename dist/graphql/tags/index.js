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
Object.defineProperty(exports, "__esModule", { value: true });
const create_tag_1 = require("../../services/tags/create-tag");
const delete_tag_1 = require("../../services/tags/delete-tag");
const get_tags_1 = require("../../services/tags/get-tags");
const update_tag_1 = require("../../services/tags/update-tag");
const utils_1 = require("../../utils/utils");
const todo = {
    Query: {
        getTags: (0, utils_1.withAuthMiddleware)('org:todo:read', (_, __, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, get_tags_1.getTags)(context); })),
    },
    Mutation: {
        createTag: (0, utils_1.withAuthMiddleware)('org:todo:create', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, create_tag_1.createTag)(payload, context); })),
        updateTag: (0, utils_1.withAuthMiddleware)('org:todo:update', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, update_tag_1.updateTag)(payload, context); })),
        deleteTag: (0, utils_1.withAuthMiddleware)('org:todo:delete', (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () { return (0, delete_tag_1.deleteTag)(payload, context); })),
    }
};
exports.default = todo;
