import { makeExecutableSchema } from "@graphql-tools/schema";
import { redisPub, redisSub } from "../redis";

const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Book {
    id: ID!
    title: String!
    description: String!
    author: User
    created_at: String
    updated_at: String
  }

  type Query {
    me(token: String!): User
    getBooksList: [Book]
    getBookById(id: ID!): Book
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): String
    login(email: String!, password: String!): String
    createBook(title: String!, description: String!, authorId: ID!): Book
    updateBook(id: ID!, title: String, description: String): Book
  }
`;

const publishAndWait = async (queue: string, data: object) => {
  return new Promise((resolve, reject) => {
    const requestId = Date.now().toString();
    const channel = `${queue}_response_${requestId}`;

    console.log(`subbing to: ${channel}`);

    redisSub.subscribe(channel, (err, count) => {
      if (err) {
        console.error("err while subbing:", err);
        return reject(err);
      }

      console.log(`pubing ${queue}:`, { ...data, requestId });
      const success = redisPub.publish(queue, JSON.stringify({ ...data, requestId }));
      
      if (!success) {
        return reject(new Error("err pubing to redis"));
      }

      redisSub.on("message", (respChannel, message) => {
        if (respChannel === channel) {
          console.log(`received msg from ${channel}:`, message);
          redisSub.unsubscribe(channel);
          resolve(JSON.parse(message));
        }
      });
    });

    setTimeout(() => {
      console.log(`TIME OUT MATE ${channel}`);
      redisSub.unsubscribe(channel);
      reject(new Error("NO TIME FOR YOU"));
    }, 5000);
  });
};


const resolvers = {
  Query: {
    me: async (_parent: any, args: { token: string }) => {
      return await publishAndWait("auth_queue", {
        action: "me",
        token: args.token,
      });
    },

    getBooksList: async () => {
      return await publishAndWait("book_queue", { action: "getBooks" });
    },

    getBookById: async (_parent: any, args: { id: number }) => {
      return await publishAndWait("book_queue", { action: "getBookById", id: args.id });
    },
  },
  Mutation: {
    register: async (_parent: any, args: { name: string; email: string; password: string }) => {
      return await publishAndWait("auth_queue", { action: "register", ...args });
    },

    login: async (_parent: any, args: { email: string; password: string }) => {
      return await publishAndWait("auth_queue", { action: "login", ...args });
    },

    createBook: async (_parent: any, args: { title: string; description: string; authorId: number }) => {
      return await publishAndWait("book_queue", { action: "createBook", ...args });
    },

    updateBook: async (_parent: any, args: { id: number; title?: string; description?: string }) => {
      return await publishAndWait("book_queue", { action: "updateBook", ...args });
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });
