import { Request, Response } from "express";
import { getGoogleAuthURL, getGoogleOAuthToken } from "./service";
import { createUser } from "../user/service";
import {
  decodeGoogleIdToken,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../../utils/auth";
import { GoogleUserDecodeType } from "./types";
import { refreshTokenSecret } from "../../config/data";
import { JwtPayload } from "jsonwebtoken";

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
    const googleUser: GoogleUserDecodeType = decodeGoogleIdToken(id_token);

    if (!googleUser) {
      res.redirect("http://localhost:3000");
      return;
    }

    const user = await createUser({
      name: googleUser.name,
      email: googleUser.email,
      googleId: googleUser.sub,
      picture: googleUser.picture,
      role: "STUDENT",
    });

    res.cookie("refreshToken", user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
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

export const googleLogoutController = (req: Request, res: Response) => {
  console.log("cookies:", req.cookies);
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });
  res.status(200).json({ message: "logged out successfully" });
};

export const googleRefreshController = (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token missing" });
    return;
  }
  try {
    const decoded = verifyToken(refreshToken, refreshTokenSecret) as JwtPayload;

    const accessToken = generateAccessToken({
      id: decoded.id,
      role: decoded.role,
    });

    const newRefreshToken = generateRefreshToken({
      id: decoded.id,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });

    res.status(200).json({
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
    return;
  }
};

/*
TODO
error handling middleware
*/
