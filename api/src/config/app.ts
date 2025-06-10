import "dotenv/config";
import express from "express";
import cors from "cors";
import googleRouter from "../modules/google/router";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", googleRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});
export default app;
