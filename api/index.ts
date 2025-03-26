import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import express from 'express'
import NodeCache from "node-cache";

import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express'

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

import typeDefs from './graphql/typeDefs'

const resolvers = mergeResolvers([
    noteCommentResolvers,
    noteResolvers,
    todoCommentResolvers,
    todoResolvers,
    tagResolvers,
    userResolvers
]);

const port = process.env.PORT || 5000

const corsOptions = {
    origin: ['https://todo-note-seven.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
    exposedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}

// Custom auth middleware
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
        res.status(401).json({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
        return;
    }
    next();
};

async function startServer() {
    const app = express()

    // Apply CORS first
    app.use(cors(corsOptions))

    // Handle preflight requests
    app.options('*', cors(corsOptions))

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    // Root endpoint
    app.get('/', (req, res) => {
        res.status(200).json({ message: 'Todo Note API is running' });
    });

    // Create HTTP server
    const httpServer = http.createServer(app)

    // Create Apollo Server
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

    // Start Apollo Server
    await server.start()

    // Create Apollo middleware
    const apolloMiddleware = expressMiddleware(server, {
        context: async ({ req, res }) => {
            return { req, res }
        },
    })

    // Apply GraphQL middleware with authentication
    app.use('/graphql', 
        express.json(),
        clerkMiddleware(),
        authMiddleware,
        apolloMiddleware as any
    )

    // Start HTTP server
    await new Promise<void>((resolve) => {
        httpServer.listen({ port }, resolve)
    })

    console.log(`🚀 Server ready at http://localhost:${port}/graphql`)
}

// Start the server
startServer().catch((err) => {
    console.error('Failed to start server:', err)
    process.exit(1)
})

export const cache = new NodeCache({ stdTTL: 60 * 5 });