import 'reflect-metadata';
import { AppDataSource } from "./data-source";
import express, { Express, Request, Response } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { UserResolver } from "./resolvers/user";

const main = async () => {
    const appDataSource = await AppDataSource.initialize();

    const app: Express = express();
    app.get("/", (req: Request, res: Response) => {
        res.send("Hello World!");
    });

    const appolloserver = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, UserResolver],
            validate: false,
        }),
        context: () => ({ appDataSource })
    });

    await appolloserver.start();

    appolloserver.applyMiddleware({ app });

    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
};

main().then(() => {
    console.log("Server is running");
});

