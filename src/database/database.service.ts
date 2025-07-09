import { Injectable, OnModuleInit } from "@nestjs/common";
import { MongoClient, Db } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit {
  private client: MongoClient;
  private db: Db;

  async onModuleInit() {
    this.client = new MongoClient(
      "mongodb+srv://bhagyakarada26:HzYVQXWYlBXtKRsX@chatapp.oci2wxx.mongodb.net/?retryWrites=true&w=majority&appName=chatApp"
    );
    await this.client.connect();
    this.db = this.client.db("mydatabase");
    console.log("✅ MongoDB connected");
  }

  getDb(): Db {
    return this.db;
  }
}
