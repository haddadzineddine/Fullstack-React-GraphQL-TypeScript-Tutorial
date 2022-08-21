import { Arg, Ctx, Int, Query, Resolver } from "type-graphql";
import { User } from "../entity/User";
import { MyContext } from "../types";

@Resolver()
export class UserResolver {

    @Query(() => [User])
    async users(
        @Ctx() { appDataSource }: MyContext
    ): Promise<User[]> {
        const userRepository = await appDataSource.getRepository(User);

        return userRepository.find();
    }

    @Query(() => User)
    async user(
        @Arg("id", () => Int) id: number,
        @Ctx() { appDataSource }: MyContext
    ): Promise<User> {
        const userRepository = await appDataSource.getRepository(User);

        return userRepository.findOne({
            where: { id }
        });
    }
}