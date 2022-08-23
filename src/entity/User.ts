import { Field, ObjectType } from "type-graphql"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@ObjectType()
@Entity()
export class User {

    @Field()
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column()
    username: string

    @Field()
    @Column({ unique: true })
    email: string

    @Column()
    password: string

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

}

