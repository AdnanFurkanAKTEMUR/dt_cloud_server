import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import jwt from "jsonwebtoken";

export const getUserSettings = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: userId });

    if (!user) return res.status(404).json({ message: "User not found" });

    const { categories, sources, authors, name, phone, email } = user;
    return res.json({ categories, sources, authors, name, phone, email });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user settings" });
  }
};

export const updateUserSettings = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { categories, sources, authors, name, phone } = req.body;

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: userId });

    if (!user) return res.status(404).json({ message: "User not found" });

    user.categories = categories || user.categories;
    user.sources = sources || user.sources;
    user.authors = authors || user.authors;
    user.name = name || user.name;
    user.phone = phone || user.phone;

    await userRepo.save(user);

    const tokenPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      categories: user.categories,
      sources: user.sources,
      authors: user.authors,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });


    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 2,
    });

    return res.json({ message: "Settings updated successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Error updating settings" });
  }
};
