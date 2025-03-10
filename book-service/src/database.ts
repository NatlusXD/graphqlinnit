import { DataSource } from "typeorm";
import { Book } from "./entities/Book";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.POSTGRES_URL,
  entities: [Book],
  synchronize: true,
});

export const connectDB = async () => {
  await AppDataSource.initialize();
  console.log("connected to books_db");
};
