import fs from 'fs';
import path from 'path';
import { mergeTypeDefs } from "@graphql-tools/merge";

const graphqlFilePaths = [   
    './dist/graphql/note-comments/index.graphql',
    './dist/graphql/notes/index.graphql',
    './dist/graphql/todo-comments/index.graphql',
    './dist/graphql/todos/index.graphql',
    './dist/graphql/tags/index.graphql',
    './dist/graphql/users/index.graphql'
]

const parsedGraphqlFiles = graphqlFilePaths.map(filePath => {
    const file = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8');
    return file;
});

const typeDefs = mergeTypeDefs(parsedGraphqlFiles);

export default typeDefs;