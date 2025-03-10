import * as express from "express";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./graphql/schema";
// import { resolvers } from "./graphql/resolvers";
import { Request } from "express";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log("request:", req.method, req.url);
  console.log("body:", req.body);
  next();
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
    context: ({ req }: { req: Request }) => ({ req })
  })
);

app.listen(4000, "0.0.0.0", () => {
  console.log(`api gateway is launched on http://0.0.0.0:4000/graphql`);
});
