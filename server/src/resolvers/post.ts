import {Arg, Ctx, Field, InputType, Mutation, Query, Resolver} from "type-graphql";
import {Post} from "../entities/Post";
import {MyContext} from "../types";

@InputType()
class PostInput {
    @Field()
    title: string;

    @Field()
    text: string;
}

@Resolver()
export default class PostResolver {
    @Query(() => [Post])
    posts(): Promise<Post[]> {
        return Post.find();
    }

    @Query(() => Post, {nullable: true})
    post(
        @Arg('id',) id: number,
    ): Promise<Post | undefined> {
        return Post.findOne(id)
    }

    @Mutation(() => Post)
    async createPost(
        @Arg('input') input: PostInput,
        @Ctx() ctx: MyContext,
    ): Promise<Post> {
        if(!ctx.req.session.userId) {
            throw new Error('not authenticated');
        }

        return Post.create({
            ...input,
            creatorId: ctx.req.session.userId,
        }).save();
    }

    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg('id') id: number,
        @Arg('title') title: string,
    ): Promise<Post | null> {
        const post = await Post.findOne(id);
        if (!post) {
            return null;
        }

        if (title) {
            await Post.update({id}, {title});
        }

        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id') id: number,
    ): Promise<boolean> {
        await Post.delete(id);
        return true;
    }
}
