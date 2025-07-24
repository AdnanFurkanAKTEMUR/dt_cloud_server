
import { Options } from 'swagger-jsdoc';
import dotenv from "dotenv";
dotenv.config();

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'Express + TypeScript + Swagger örneği',
    },
    servers: [
      {
        url: `http://localhost:#${process.env.PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};
