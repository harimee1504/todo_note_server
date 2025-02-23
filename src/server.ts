import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import express from 'express'
import NodeCache from "node-cache";

import { clerkMiddleware, requireAuth } from '@clerk/express'

import { ApolloServer, BaseContext } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'

import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeResolvers } from "@graphql-tools/merge";

const resolvers = mergeResolvers(loadFilesSync('./src/graphql/**/*.ts'));
const typeDefs = loadFilesSync('./src/graphql/**/*.graphql')

const port = process.env.PORT || 5000
const corsOptions = {
    origin: ['https://todo-note-seven.vercel.app', 'http://localhost:3001', "https://31mi1.h.filess.io"],
    credentials: true,
}

const app = express()

app.use(clerkMiddleware(), cors(corsOptions))

const httpServer = http.createServer(app)

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

let cachedServer: any;

async function initialize() {
    await server.start()
    
    const apolloMiddleware = expressMiddleware(server, {
        context: async ({ req, res }) => {
            return { req, res }
        },
    })
    
    app.use('/graphql', express.json(), requireAuth(), apolloMiddleware as any)
    
    await new Promise<void>((resolve) => httpServer.listen({ port: port, host: '0.0.0.0' }, resolve))
    
    console.log(`Server is running on port http://localhost:${port}`)
    
    cachedServer = server;
    return server;

}

initialize();

export const cache = new NodeCache({ stdTTL: 60 * 5 });

export default app;