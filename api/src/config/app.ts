import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { googleRouter } from "../modules/google";
import { errorHandler, notFoundHandler } from "../middleware/error";

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/auth", googleRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 404 handler - tüm route'lardan sonra
app.use(notFoundHandler);

// Error handler - en son middleware olmalı
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    errorHandler(err, req, res, next);
  }
);
export default app;
