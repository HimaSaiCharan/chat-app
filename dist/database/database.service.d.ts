import { OnModuleInit } from "@nestjs/common";
import { Db } from "mongodb";
export declare class DatabaseService implements OnModuleInit {
    private client;
    private db;
    onModuleInit(): Promise<void>;
    getDb(): Db;
}
