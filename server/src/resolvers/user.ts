import {Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver} from "type-graphql";
import argon2 from 'argon2';

import {MyContext} from "../types";
import {User} from "../entities/User";
import {COOKIE_NAME} from "../constants";
import {UsernamePasswordInput} from "./UsernamePasswordInput";
import {validateRegister} from "../utils/validateRegister";

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
        if (!ctx.req.session.userId) {
            return null
        }

        const user = await ctx.em.findOne(User, {id: ctx.req.session.userId});
        if (!user) {
            return null;
        }

        return user;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() ctx: MyContext,
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if (errors) {
            return {errors};
        }

        const hashPassword = await argon2.hash(options.password);
        const user = ctx.em.create(User, {
            username: options.username,
            email: options.email,
            password: hashPassword
        });

        try {
            await ctx.em.persistAndFlush(user);
        } catch (err) {
            if (err.code === '23505') {
                const isEmailError = err.detail.includes('email');

                return {
                    errors: [
                        {
                            field: isEmailError ? 'email' : 'username',
                            message: `${isEmailError ? 'email' : 'username'} already taken`,
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
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() ctx: MyContext,
    ): Promise<UserResponse> {
        const isEmail = usernameOrEmail.includes('@');

        const user = await ctx.em.findOne(User,
            isEmail ?
                {email: usernameOrEmail} :
                {username: usernameOrEmail}
        );

        if (!user) {
            return {
                errors: [
                    {
                        field: 'usernameOrEmail',
                        message: `that ${isEmail ? 'email' : 'username'} doesn't exist`,
                    }
                ]
            }
        }

        const valid = await argon2.verify(user.password, password);
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
