import { Request, Response } from "express"
import { DataSource } from "typeorm"


export type MyContext = {
    appDataSource: DataSource,
    req: Request,
    res: Response
}