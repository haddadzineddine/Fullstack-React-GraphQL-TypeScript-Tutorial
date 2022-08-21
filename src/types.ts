import { DataSource } from "typeorm"


export type MyContext = {
    appDataSource: DataSource
}