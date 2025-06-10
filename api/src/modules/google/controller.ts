import { Request, Response } from "express";
import { getGoogleAuthURL } from "./service";

export const googleAuthController = (req: Request, res: Response) => {
  const url = getGoogleAuthURL();
  console.log(url);
  res.redirect(url);
};
