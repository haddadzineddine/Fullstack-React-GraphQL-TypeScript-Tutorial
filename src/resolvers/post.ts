import { Ctx, Query, Resolver } from "type-graphql";
import { Post } from "../entity/Post";
import { MyContext } from "../types";


@Resolver()
export class PostResolver {

    @Query(() => [Post])
    posts(
        @Ctx() { appDataSource }: MyContext
    ): Promise<Post[]> {
        const postRepository = appDataSource.getRepository(Post);

        return postRepository.find();
    }
}