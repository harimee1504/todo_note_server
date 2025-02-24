import fs from 'fs';
import path from 'path';
import { mergeTypeDefs } from "@graphql-tools/merge";

const graphqlFilePaths = [   
    'api/graphql/note-comments/index.graphql',
    'api/graphql/notes/index.graphql',
    'api/graphql/todo-comments/index.graphql',
    'api/graphql/todos/index.graphql',
    'api/graphql/tags/index.graphql',
    'api/graphql/users/index.graphql'
]

const parsedGraphqlFiles = graphqlFilePaths.map(filePath => {
    const file = fs.readFileSync(path.resolve(process.cwd(), filePath), { encoding: 'utf-8' });
    return file;
});

const typeDefs = mergeTypeDefs(parsedGraphqlFiles);

export default typeDefs;