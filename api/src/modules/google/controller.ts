import { Request, Response } from "express";
import { getGoogleAuthURL, getGoogleOAuthToken } from "./service";
import { createUser } from "../user/service";
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
  try {
    const { id_token } = await getGoogleOAuthToken(code);
    const googleUser = jwt.decode(id_token);

    if (!googleUser) {
      res.redirect("http://localhost:3000");
      return;
    }

    const user = await createUser({
      name: googleUser.name,
      email: googleUser.email,
      googleId: googleUser.sub,
      picture: googleUser.picture,
    });

    res.cookie("refreshToken", user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    if (user.message === "user signed up successfully") {
      res.status(201).json({
        data: user,
      });
      return;
    }

    res.status(200).json({
      data: user,
    });
  } catch (error: any) {
    console.log("ERROR:", error);
    res.redirect("http://localhost:3000");
    //login sayfasına yönlendir
  }
};
