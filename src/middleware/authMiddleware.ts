import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      email: string;
      name: string;
      phone: string;
      categories: string[];
      sources: string[];
      authors: string[];
    };

    req.userId = decoded.userId;
    req.email = decoded.email;
    req.name = decoded.name;
    req.phone = decoded.phone;
    req.categories = decoded.categories;
    req.sources = decoded.sources;
    req.authors = decoded.authors;

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
