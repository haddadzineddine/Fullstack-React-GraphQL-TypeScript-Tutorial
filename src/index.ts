import 'reflect-metadata';
import { AppDataSource } from "./data-source";
import express, { Express, Request, Response } from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user";
import { PostResolver } from './resolvers/post';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { __prod__ } from './constants';
import { MyContext } from './types';
import Redis from 'ioredis';

const main = async () => {
    const appDataSource = await AppDataSource.initialize();

    const redisStore = connectRedis(session);

    const redisClient = new Redis();

    const cookieConfig = {
        httpOnly: true,
        secure: __prod__
    }

    const sessionConfig = {
        name: 'qid',
        store: new redisStore({ client: redisClient }),
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: cookieConfig
    };

    const app: Express = express();
    app.use(session(sessionConfig))

    app.get("/", (req: Request, res: Response) => {
        res.send("Hello");
    });

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver, PostResolver],
            validate: false,
        }),
        context: ({ req, res }): MyContext => ({ appDataSource, req, res }),
        plugins: [
            ApolloServerPluginLandingPageLocalDefault({ embed: true }),
        ],
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app });

    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
};

main().then(() => {
    console.log("Server is running");
});

