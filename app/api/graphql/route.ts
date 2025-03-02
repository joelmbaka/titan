import { ApolloServer } from 'apollo-server-micro';
import { schema } from './schema';
import { storeResolvers, productResolvers } from './resolvers';

const server = new ApolloServer({
  schema,
  resolvers: {
    ...storeResolvers,
    ...productResolvers,
    // Add other resolvers as needed
  },
});

export default server.createHandler({ path: '/api/graphql' }); 