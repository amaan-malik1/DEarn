import express from "express";
const router = express.Router();

router.post("/signin", signinController);

export default router;