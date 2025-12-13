import type { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prismaClient = new PrismaClient();
const JWT_SECRET_USER = process.env.JWT_SECRET_USER || " ";

export const authRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.jwt;

  try {
    if (!token) {
      return res.json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET_USER);

    if (!decoded) {
      return res.status(401).json({
        message: "Invalid or token expired",
      });
    }

    //@ts-ignore
    const userPresent = await prismaClient.user.findFirst(decoded.userId);

    if (!userPresent) {
      return res.status(401).json({
        message: "Unauthorized - User not found",
      });
    }

    //@ts-ignore
    req.user = userPresent;
    next();
  } catch (error) {
    console.log("Error in authorizing middleware: ", error);
    res.status(401).json({
      message: "Internal server error",
    });
  }
};
