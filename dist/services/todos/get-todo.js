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
exports.getTodo = void 0;
const _1 = require(".");
const getTodo = (payload, context) => __awaiter(void 0, void 0, void 0, function* () {
    const { by, options = {} } = payload === null || payload === void 0 ? void 0 : payload.input;
    const ENUM = {
        orgId: () => (0, _1.getFilteredTodo)(by, options, context),
        todo: () => (0, _1.getFilteredTodo)(by, options, context),
        isPrivate: () => (0, _1.getFilteredTodo)(by, options, context),
        description: () => (0, _1.getFilteredTodo)(by, options, context),
        status: () => (0, _1.getFilteredTodo)(by, options, context),
        createdBy: () => (0, _1.getFilteredTodo)(by, options, context),
        dueDate: () => (0, _1.getFilteredTodo)(by, options, context),
        dateRange: () => (0, _1.getFilteredTodo)(by, options, context),
        tags: () => (0, _1.getTodoByTags)(by, options, context),
        mentions: () => (0, _1.getTodoByMentions)(by, options, context),
        assignedTo: () => (0, _1.getTodoByAssignedTo)(by, options, context),
    };
    if (!ENUM[by]) {
        throw new Error('Invalid filter type');
    }
    try {
        const todos = yield ENUM[by]();
        return todos;
    }
    catch (error) {
        console.error('Failed to fetch todos:', error);
        throw new Error('Failed to fetch todos.');
    }
});
exports.getTodo = getTodo;
