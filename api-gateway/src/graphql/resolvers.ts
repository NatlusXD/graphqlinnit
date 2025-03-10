// import Redis from "ioredis";
// import { redisPub, redisSub } from "../redis";


// const publishAndWait = async (queue: string, data: object) => {
//   return new Promise((resolve, reject) => {
//     const requestId = Date.now().toString();
//     const channel = `${queue}_response_${requestId}`;

//     console.log(`subbing to: ${channel}`);

//     redisSub.subscribe(channel, (err, count) => {
//       if (err) {
//         console.error("err:", err);
//         return reject(err);
//       }

//       console.log(`publishing ${queue}:`, { ...data, requestId });
//       const success = redisPub.publish(queue, JSON.stringify({ ...data, requestId }));
      
//       if (!success) {
//         console.error(`pub err ${queue}`);
//         return reject(new Error("pub err in Redis"));
//       }

//       redisSub.on("message", (respChannel, message) => {
//         if (respChannel === channel) {
//           console.log(`received msg from ${channel}:`, message);
//           redisSub.unsubscribe(channel);
//           resolve(JSON.parse(message));
//         }
//       });
//     });

//     setTimeout(() => {
//       console.log(`time out mate ${channel}`);
//       redisSub.unsubscribe(channel);
//       reject(new Error("NO TIME FOR YOU"));
//     }, 5000);
//   });
// };



// export const resolvers = {
//   Query: {
//     test: () => {
//       return "graphql is working";
//     },
//     me: async ({ token }: { token: string }) => {
//       return await publishAndWait("auth_queue", { action: "me", token });
//     },
//     getBooksList: async () => {
//       return await publishAndWait("book_queue", { action: "getBooks" });
//     },
//     getBookById: async ({ id }: { id: number }) => {
//       return await publishAndWait("book_queue", { action: "getBookById", id });
//     },
//     register: async (args: any) => {
//       return "query register";
//     }
//   },

//   Mutation: {
//     register: async (_parent: any, args: any) => {

//       const input = args.input || args;

//       return "register mutation";
//     },
//     login: async ({ email, password }: { email: string; password: string }) => {
//       return await publishAndWait("auth_queue", { action: "login", email, password });
//     },
//     createBook: async ({ title, description, authorId }: { title: string; description: string; authorId: number }) => {
//       return await publishAndWait("book_queue", { action: "createBook", title, description, authorId });
//     },
//     updateBook: async ({ id, title, description }: { id: number; title?: string; description?: string }) => {
//       return await publishAndWait("book_queue", { action: "updateBook", id, title, description });
//     },
//   },
// };
