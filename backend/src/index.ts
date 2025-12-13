import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import userRouter from "./routers/user.js";
import workerRouter from "./routers/worker.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json()); // it help in parsing the user's data middleware
app.use(cookieParser());

// routers
app.use("/api/v1/user", userRouter);
app.use("/api/v1/worker", workerRouter);

app.listen(PORT, () => {
  console.log(`Server running successfully at: https://localhost:${PORT}`);
});
