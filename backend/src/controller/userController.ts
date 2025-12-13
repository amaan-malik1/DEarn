import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import dotenv from "dotenv";

import { PrismaClient } from "../generated/prisma/client.js";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createTaskInput } from "../utils/types.js";

dotenv.config();

//@ts-ignore
const prismaClient = new PrismaClient();

const JWT_SECRET_USER = process.env.JWT_SECRET_USER || "user894fun8s893fjs90";
const DEFAULT_TITLE = "Select the most clickable thumbnail";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
  region: "us-east-1",
});

//making signIn endpoint using the wallet address
export const signin = async (req: Request, res: Response) => {
  const userWalletAddress = "5AXoBsbNa743FNQ6oe1xV2ei3RdLKb83hTwJZKMyT2dW";

  if (!userWalletAddress) {
    // return res.json({
    //   message: "wallet not connected",
    // });
    return alert("Wallet not Connected!");
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

    const token = jwt.sign(payload, JWT_SECRET_USER);

    //token return

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // time in milisec
      httpOnly: true, // prevent xss attacks
      sameSite: "none", // prevent csrf attacks
      secure: process.env.NODE_ENV === "production",
    });
    res.json({ token });
  } else {
    const newUser = await prismaClient.user.create({
      data: {
        address: userWalletAddress,
      },
    });
    const payload = {
      userId: newUser.id,
      address: newUser.address,
    };

    const token = jwt.sign(payload, JWT_SECRET);

    res.cookie("jwt", token, {
      maxAge: 3 * 24 * 60 * 60 * 1000, //in milisec
      sameSite: "none",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.json({
      message: "token sent",
      token: token,
    });
  }
};

// setting preSigned URL for thumbnail user sent....
export const getPresignURL = async (req: Request, res: Response) => {
  //@ts-ignore
  const userId = req.user.id;

  const command = new PutObjectCommand({
    Bucket: "harkirat-cms",
    Key: `/fiver/${userId}/${Math.random()}/image.jpg`, //here we haev structured every user's img folder
    ContentType: "img/jpg",
  });

  const preSignedURL = await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 60,
  });

  console.log(preSignedURL);

  res.json({
    preSignedURL,
  });
};

//handling the task controller
export const createTask = async (req: Request, res: Response) => {
  const body = req.body;
  //@ts-ignore
  const userId = req.user.id;

  const parseData = createTaskInput.safeParse(body);
  if (!parseData.success) {
    return res.json({
      message: "You've sent wrong data",
    });
  }

  prismaClient.$transaction(async (tx) => {
    const response = await tx.task.create({
      data: {
        title: parseData.data.title ?? DEFAULT_TITLE,
        amount: "1",
        pay_signature: parseData.data.signature,
        user_id: userId,
      },
    });

    await tx.option.createMany({
      data:parseData.data.options.map(x=>{
        image_url:x.imgageUrl,
        task_id:response.id,
      })
    })
  });
};
