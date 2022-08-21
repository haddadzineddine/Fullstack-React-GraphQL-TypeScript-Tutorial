import { Field, ObjectType } from "type-graphql"
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@ObjectType()
@Entity()
export class User {

    @Field()
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column()
    firstName: string

    @Field()
    @Column()
    lastName: string

    @Field()
    @Column()
    age: number

}
