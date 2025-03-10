import { DataSource } from "typeorm";
import { User } from "./entities/User";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.POSTGRES_URL,
  synchronize: true,
  logging: true,
  entities: [User],
});

export const connectDB = async () => {
  await AppDataSource.initialize();
  console.log("connected to db");
};
