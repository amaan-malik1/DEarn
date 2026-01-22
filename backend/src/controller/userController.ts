import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createTaskInput } from "../utils/types.js";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "../generated/prisma/client.js";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const prismaClient = new PrismaClient({
  accelerateUrl: DATABASE_URL as string,
}).$extends(withAccelerate());

const JWT_SECRET = process.env.JWT_SECRET_USER;

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
    // const payload = {
    //   ,
    // };

    if (!JWT_SECRET) {
      return console.log("JWT_SECRET not loaded!");
    }

    const token = jwt.sign({ userId: userExisted.id }, JWT_SECRET);

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
    // const payload = {};

    //@ts-ignore
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);

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

  prismaClient.$transaction(async (tx: any) => {
    const response = await tx.task.create({
      data: {
        title: parseData.data.title ?? DEFAULT_TITLE,
        amount: 1,
        pay_signature: parseData.data.signature,
        user_id: userId,
      },
    });

    await tx.option.createMany({
      data: parseData.data.options.map((x) => ({
        image_url: x.imgageUrl,
        task_id: response.id,
      })),
    });
  });
};

export const getTask = async (req: Request, res: Response) => {
  const taskId = req.query.task_Id;
  //@ts-ignore
  const userId = req.user.id;

  const taskDetails = await prismaClient.task.findFirst({
    where: {
      user_id: userId,
      //@ts-ignore
      taskId: taskId,
    },
  });

  if (!taskDetails) {
    return res.status(411).json({
      message: "You don't have access to thsi task",
    });
  }

  ///TODO: Try to make it faster
  const responses = await prismaClient.submission.findMany({
    where: {
      task_id: Number(taskId),
    },
    include: {
      task: true,
    },
  });

  const result = {};

  responses.forEach();
};
