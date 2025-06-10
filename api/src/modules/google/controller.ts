import { Request, Response } from "express";
import { getGoogleAuthURL, getGoogleOAuthToken } from "./service";
import jwt from "jsonwebtoken";
export const googleAuthController = (req: Request, res: Response) => {
  const url = getGoogleAuthURL();
  res.redirect(url);
};

export const googleAuthCallbackController = async (
  req: Request<{}, {}, {}, { code: string }>,
  res: Response
) => {
  const code = req.query.code;
  console.log("CODE:", code);
  try {
    const { access_token, id_token } = await getGoogleOAuthToken(code);
    console.log("ACCESS_TOKEN:", access_token);
    console.log("ID_TOKEN:", id_token);
    const googleUser = jwt.decode(id_token);
    console.log(googleUser);
  } catch (error: any) {
    console.log("ERROR:", error);
    res.redirect("http://localhost:3000");
    //login sayfasına yönlendir
  }
};
