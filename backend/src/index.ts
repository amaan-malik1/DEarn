import express from "express";
const app = express();
import userRouter from "./routers/user.js";
import workerRouter from "./routers/worker.js";

app.use(express.json());

// user routers
app.use("/api/v1/user", userRouter);
app.use("/api/v1/worker", workerRouter);

app.listen(3000);
