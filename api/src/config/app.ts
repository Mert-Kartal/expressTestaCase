import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { googleRouter } from "../modules/google";

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/auth", googleRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});
export default app;
