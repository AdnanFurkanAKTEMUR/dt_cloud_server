import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    userId?: number;
    email?: string;
    name?: string;
    phone?: string;
    categories?: string[];
    sources?: string[];
    authors?: string[];
  }
}
