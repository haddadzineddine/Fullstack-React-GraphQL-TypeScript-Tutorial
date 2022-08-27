import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { MinLength } from "class-validator"
import { User } from "../entity/User";
import { MyContext } from "../types";
import * as argon2 from "argon2";

@InputType()
class CredentialsInput {
    @Field()
    @MinLength(3)
    username: string

    @Field()
    @MinLength(8)
    password: string
}


@InputType()
class RegisterUserInput extends CredentialsInput {

    @Field()
    email: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string

    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}


@Resolver()
export class UserResolver {

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req, appDataSource }: MyContext
    ) {
        if (!req.session.userId) {
            return null;
        }

        const userRepository = appDataSource.getRepository(User);

        return await userRepository.findOneBy({
            id: req.session.userId
        })
    }

    @Query(() => [User])
    users(
        @Ctx() { appDataSource }: MyContext
    ): Promise<User[]> {
        const userRepository = appDataSource.getRepository(User);

        return userRepository.find();
    }

    @Query(() => User, { nullable: true })
    async user(
        @Arg("id") id: number,
        @Ctx() { appDataSource }: MyContext
    ): Promise<User | null> {
        const userRepository = await appDataSource.getRepository(User);

        return userRepository.findOne({
            where: { id }
        });
    }


    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: RegisterUserInput,
        @Ctx() { appDataSource, req }: MyContext
    ): Promise<UserResponse> {
        const userRepository = await appDataSource.getRepository(User);
        const hashedPassword = await argon2.hash(options.password);

        if (options.username.length < 3) {
            return {
                errors: [{
                    field: "username",
                    message: "username must be at least >=3 characters"
                }]
            }
        }

        if (options.password.length < 8) {
            return {
                errors: [{
                    field: "password",
                    message: "password must be at least >=8 characters"
                }]
            }
        }

        const user = await userRepository.create({
            username: options.username,
            email: options.email,
            password: hashedPassword
        });

        await userRepository.save(user);

        // store userId on the server side and send request with cookie named 'qid' which is the 
        // session id and send it on every subsequent request !
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: CredentialsInput,
        @Ctx() { appDataSource, req }: MyContext
    ): Promise<UserResponse> {
        const userRepository = appDataSource.getRepository(User);

        const user = await userRepository.findOneBy({
            username: options.username
        });

        if (!user) {
            return {
                errors: [{
                    field: "username",
                    message: "could'nt find a user with this username"
                }]
            }
        }

        const validPassword = await argon2.verify(user.password, options.password);

        if (!validPassword) {
            return {
                errors: [{
                    field: "password",
                    message: "password is incorrect !"
                }]
            }
        }

        req.session.userId = user.id;

        return {
            user
        }
    }

}

