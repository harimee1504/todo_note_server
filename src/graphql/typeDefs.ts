import { loadFilesSync } from '@graphql-tools/load-files'

const typeDefs = loadFilesSync('./**/*.graphql')

export default typeDefs;