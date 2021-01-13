import {Arg, Mutation, Query, Resolver} from "type-graphql";
import {Post} from "../entities/Post";
import {DeepPartial} from "typeorm";

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
        @Arg('title') title: string,
    ): Promise<DeepPartial<Post>> {
        return Post.create({title}).save();
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
