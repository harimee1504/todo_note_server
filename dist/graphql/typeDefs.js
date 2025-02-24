"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const merge_1 = require("@graphql-tools/merge");
const graphqlFilePaths = [
    './dist/graphql/note-comments/index.graphql',
    './dist/graphql/notes/index.graphql',
    './dist/graphql/todo-comments/index.graphql',
    './dist/graphql/todos/index.graphql',
    './dist/graphql/tags/index.graphql',
    './dist/graphql/users/index.graphql'
];
const parsedGraphqlFiles = graphqlFilePaths.map(filePath => {
    const file = fs_1.default.readFileSync(path_1.default.join(process.cwd(), filePath), 'utf-8');
    return file;
});
const typeDefs = (0, merge_1.mergeTypeDefs)(parsedGraphqlFiles);
exports.default = typeDefs;
