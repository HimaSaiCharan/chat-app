import { Injectable, OnModuleInit } from "@nestjs/common";
import { MongoClient, Db } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit {
  private client: MongoClient;
  private db: Db;

  async onModuleInit() {
    this.client = new MongoClient("mongodb://127.0.0.1:27017");
    await this.client.connect();
    this.db = this.client.db("mydatabase");
    console.log("✅ MongoDB connected");
  }

  getDb(): Db {
    return this.db;
  }
}
