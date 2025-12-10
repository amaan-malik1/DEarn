import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma/client.js";

const prismaClient = new PrismaClient();
const JWT_SECRET = "1298eb78shd7378r7f7h38hiwmiu8nalU8cnln74";

export const signin = async (req: Request, res: Response) => {
  const userWalletAddress = "5AXoBsbNa743FNQ6oe1xV2ei3RdLKb83hTwJZKMyT2dW";

  if (!userWalletAddress) {
    alert("Wallet not Connected!");
  }

  const userExisted = await prismaClient.user.findFirst({
    where: {
      address: userWalletAddress,
    },
  });

  if (userExisted) {
    const payload = {
      userId: userExisted.id,
    };

    const token = jwt.sign(payload, JWT_SECRET);

    //token return
    res.json({ token });
  } else {
    const newUser = await prismaClient.user.create({
      data: {
        address: userWalletAddress,
      },
    });
    const payload = {
      userId: newUser.id,
    };

    const token = jwt.sign(payload, JWT_SECRET);
    res.json({
      token,
    });
  }
};
