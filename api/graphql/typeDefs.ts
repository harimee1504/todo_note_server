import fs from 'fs';
import path from 'path';
import { mergeTypeDefs } from "@graphql-tools/merge";

const graphqlFilePaths = [   
    'api/graphql/note-comments/schema.graphql',
    'api/graphql/notes/schema.graphql',
    'api/graphql/todo-comments/schema.graphql',
    'api/graphql/todos/schema.graphql',
    'api/graphql/tags/schema.graphql',
    'api/graphql/users/schema.graphql'
]

const parsedGraphqlFiles = graphqlFilePaths.map(filePath => {
    const file = fs.readFileSync(path.resolve(process.cwd(), filePath), { encoding: 'utf-8' });
    return file;
});

const typeDefs = mergeTypeDefs(parsedGraphqlFiles);

export default typeDefs;