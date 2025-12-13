import express from "express";
import { createTask, getPresignURL, signin } from "../controller/userController.js";
import { authRoute } from "../middleware/authRoute.js";

const router = express.Router();

router.post("/signin", signin);
router.get("/getPresignedURL",authRoute, getPresignURL);
router.get("/createTask",authRoute, createTask);

export default router;
