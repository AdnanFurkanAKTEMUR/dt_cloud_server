import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: [__dirname + "/../models/**/*.{ts,js}"],
  migrations: [isProduction ? "dist/migrations/*.js" : "src/migrations/*.ts"],
  subscribers: [],
  ssl: false,
});
