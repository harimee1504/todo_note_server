import { promises as fs} from 'fs';
import path from 'path';
import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import express from 'express'
import NodeCache from "node-cache";

import { clerkMiddleware, requireAuth } from '@clerk/express'

import { ApolloServer, BaseContext } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'

import { mergeResolvers } from "@graphql-tools/merge";

import noteCommentResolvers from './graphql/note-comments/index'
import noteResolvers from './graphql/notes/index'
import todoCommentResolvers from './graphql/todo-comments/index'
import todoResolvers from './graphql/todos/index'
import tagResolvers from './graphql/tags/index'
import userResolvers from './graphql/users/index'

const resolvers = mergeResolvers([
    noteCommentResolvers,
    noteResolvers,
    todoCommentResolvers,
    todoResolvers,
    tagResolvers,
    userResolvers
]);



const loadTypeDefs = async (filePaths: any[]) => {
    const files = await Promise.all(
      filePaths.map(async (filePath) => {
        return await fs.readFile(process.cwd() + filePath, 'utf-8');
      })
    );
    return files.join('\n');
  };


const schemaPaths = [
  './graphql/note-comments/index.graphql',
  './graphql/notes/index.graphql',
  './graphql/todo-comments/index.graphql',
  './graphql/todos/index.graphql',
  './graphql/tags/index.graphql',
  './graphql/users/index.graphql'
];


const port = process.env.PORT || 5000
const corsOptions = {
    origin: ['https://todo-note-seven.vercel.app', 'http://localhost:3001', "https://31mi1.h.filess.io"],
    credentials: true,
}

const app = express()

app.use(clerkMiddleware(), cors(corsOptions))

const httpServer = http.createServer(app)

const startApolloServer = async (app: express.Express, httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) => {
 
    const typeDefs = await loadTypeDefs(schemaPaths);

    const server = new ApolloServer<BaseContext>({
        typeDefs,
        resolvers,
        introspection: true,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
        formatError: (error) => {
            return {
                message: error.message,
                statusCode: error.extensions?.code || 500,
            }
        },
    });

    await server.start()
    
    const apolloMiddleware = expressMiddleware(server, {
        context: async ({ req, res }) => {
            return { req, res }
        },
    })
    
    app.use('/graphql', express.json(), requireAuth(), apolloMiddleware as any)
    
    await new Promise<void>((resolve) => httpServer.listen({ port: port, host: '0.0.0.0' }, resolve))
    
    console.log(`Server is running on port http://localhost:${port}`)

}

startApolloServer(app, httpServer);

export const cache = new NodeCache({ stdTTL: 60 * 5 });

export default httpServer;