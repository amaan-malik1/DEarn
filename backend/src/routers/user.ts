import express from "express";
import {
  createTask,
  getPresignURL,
  getTask,
  signin,
} from "../controller/userController.js";
import { authRoute } from "../middleware/authRoute.js";

const router = express.Router();

router.post("/signin", signin);
router.get("/getPresignedURL", authRoute, getPresignURL);
router.post("/createTask", authRoute, createTask);
router.get("/getTask", authRoute, getTask);

export default router;
