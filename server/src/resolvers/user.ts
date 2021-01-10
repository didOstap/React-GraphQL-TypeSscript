import {Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver} from "type-graphql";
import argon2 from 'argon2';

import {MyContext} from "../types";
import {User} from "../entities/User";
import {COOKIE_NAME} from "../constants";

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string

    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(() => User, {nullable: true})
    user?: User;
}

@Resolver()
export class UserResolver {
    @Query(() => User, {nullable: true})
    async me(
        @Ctx() ctx: MyContext,
    ) {
        if(!ctx.req.session.userId) {
            return null
        }

        const user = await ctx.em.findOne(User, {id: ctx.req.session.userId});
        if(!user) {
            return null;
        }

        return user;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() ctx: MyContext,
    ): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'length must be greater than 2',
                    }
                ]
            }
        }

        if (options.password.length <= 2) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'length must be greater than 2',
                    }
                ]
            }
        }

        const hashPassword = await argon2.hash(options.password);
        const user = ctx.em.create(User, {
            username: options.username,
            password: hashPassword
        });

        try {
            await ctx.em.persistAndFlush(user);
        } catch (err) {
            if(err.code === '23505') {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'username already taken',
                        }
                    ]
                }
            }
        }

        ctx.req.session.userId = user.id;

        return {user};
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() ctx: MyContext,
    ): Promise<UserResponse> {
        const user = await ctx.em.findOne(User, {username: options.username});
        if (!user) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: "that username doesn't exist",
                    }
                ]
            }
        }

        const valid = await argon2.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'incorrect password',
                    }
                ]
            }
        }

        ctx.req.session.userId = user.id;

        return {user};
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() ctx: MyContext,
    ): Promise<boolean> {
        return new Promise(resolve => {
            ctx.req.session.destroy((err: any) => {
                if (err) {
                    resolve(false);
                }

                ctx.res.clearCookie(COOKIE_NAME);
                resolve(true);
            });
        });
    }
}
