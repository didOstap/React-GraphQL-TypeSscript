import {Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver} from "type-graphql";
import argon2 from 'argon2';

import {MyContext} from "../types";
import {User} from "../entities/User";
import {COOKIE_NAME, FORGET_PASSWORD_PREFIX} from "../constants";
import {UsernamePasswordInput} from "./UsernamePasswordInput";
import {validateRegister} from "../utils/validateRegister";
import {v4} from "uuid";
import {sendEmail} from "../utils/sendEmail";

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

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() ctx: MyContext,
    ): Promise<boolean> {
        const user = await ctx.em.findOne(User, {email});

        if (!user) {
            return true;
        }

        const token = v4();

        await ctx.redis.set(
            FORGET_PASSWORD_PREFIX + token,
            user.id,
            'ex',
            1000 * 60 * 60 * 24 * 3 // 3 days
        );

        await sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
        )

        return true;
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() ctx: MyContext,
    ): Promise<UserResponse> {
        if (newPassword.length <= 2) {
            return {
                errors: [
                    {
                        field: 'newPassword',
                        message: 'length must be greater than 2',
                    }
                ]
            }
        }

        const redisKey = FORGET_PASSWORD_PREFIX + token;
        const userId = await ctx.redis.get(redisKey);
        if (!userId) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'token has been expired',
                    }
                ]
            }
        }

        const user = await ctx.em.findOne(User, {id: parseInt(userId)});
        if (!user) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'user no longer exist',
                    }
                ]
            }
        }

        user.password = await argon2.hash(newPassword);
        await ctx.em.persistAndFlush(user);

        await ctx.redis.del(redisKey);

        ctx.req.session.userId = user.id;

        return {user};
    }
}
