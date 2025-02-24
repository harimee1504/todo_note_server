"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const load_files_1 = require("@graphql-tools/load-files");
const typeDefs = (0, load_files_1.loadFilesSync)('./**/*.graphql');
exports.default = typeDefs;
