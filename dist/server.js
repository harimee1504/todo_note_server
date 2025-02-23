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
exports.cache = void 0;
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const node_cache_1 = __importDefault(require("node-cache"));
const express_2 = require("@clerk/express");
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const load_files_1 = require("@graphql-tools/load-files");
const merge_1 = require("@graphql-tools/merge");
const resolvers = (0, merge_1.mergeResolvers)((0, load_files_1.loadFilesSync)('./src/graphql/**/*.ts'));
const typeDefs = (0, load_files_1.loadFilesSync)('./src/graphql/**/*.graphql');
const port = process.env.PORT || 5000;
const corsOptions = {
    origin: ['https://todo-note-seven.vercel.app', 'http://localhost:3001', "https://31mi1.h.filess.io"],
    credentials: true,
};
const app = (0, express_1.default)();
app.use((0, express_2.clerkMiddleware)(), (0, cors_1.default)(corsOptions));
const httpServer = http_1.default.createServer(app);
const server = new server_1.ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
    formatError: (error) => {
        var _a;
        return {
            message: error.message,
            statusCode: ((_a = error.extensions) === null || _a === void 0 ? void 0 : _a.code) || 500,
        };
    },
});
let cachedServer;
function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        yield server.start();
        const apolloMiddleware = (0, express4_1.expressMiddleware)(server, {
            context: (_a) => __awaiter(this, [_a], void 0, function* ({ req, res }) {
                return { req, res };
            }),
        });
        app.use('/graphql', express_1.default.json(), (0, express_2.requireAuth)(), apolloMiddleware);
        yield new Promise((resolve) => httpServer.listen({ port: port, host: '0.0.0.0' }, resolve));
        console.log(`Server is running on port http://localhost:${port}`);
        cachedServer = server;
        return server;
    });
}
initialize();
exports.cache = new node_cache_1.default({ stdTTL: 60 * 5 });
exports.default = app;
