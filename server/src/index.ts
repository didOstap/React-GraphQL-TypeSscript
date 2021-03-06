import 'reflect-metadata'; // typeorm need to work
import {createConnection} from 'typeorm'
import express from 'express';
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from "type-graphql";
import cors from 'cors';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';

import HelloResolver from "./resolvers/hello";
import PostResolver from "./resolvers/post";
import {UserResolver} from "./resolvers/user";
import {__prod__, COOKIE_NAME} from "./constants";
import {MyContext} from "./types";
import {Post} from "./entities/Post";
import {User} from "./entities/User";
import path from "path";

const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        database: 'lireddit2',
        username: 'postgres',
        password: 'postgres',
        logging: true,
        synchronize: true, // update DB relate to current entities
        entities: [Post, User],
        migrations: [path.join(__dirname, './migrations/*')]
    });

    await conn.runMigrations();

    const app = express();

    const RedisStore = connectRedis(session)
    const redis = new Redis() as any;

    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true,
    }))

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: 'lax',
                secure: __prod__,
            },
            saveUninitialized: false,
            secret: 'keyboard cat',
            resave: false,
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({req, res}): MyContext => ({req, res, redis}),
    })

    apolloServer.applyMiddleware({
        app,
        cors: false
    })

    app.listen(4000, () => {
        console.log('4000...')
    })
}

main().catch(err => {
    console.log(err);
});