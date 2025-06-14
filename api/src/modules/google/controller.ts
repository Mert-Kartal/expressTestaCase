import { Request, Response } from "express";
import { getGoogleAuthURL, getGoogleOAuthToken } from "./service";
import {
  createUser,
  findUserByRefreshToken,
  updateRefreshToken,
  logoutUser,
} from "../user/service";
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

export const googleLogoutController = async (req: Request, res: Response) => {
  console.log("cookies:", req.cookies);

  const refreshToken = req.cookies?.refreshToken;

  // Service layer kullanarak logout
  if (refreshToken) {
    try {
      await logoutUser(refreshToken);
    } catch (error) {
      console.log("Error during logout:", error);
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });
  res.status(200).json({ message: "logged out successfully" });
};

export const googleRefreshController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token missing" });
    return;
  }

  try {
    // Service layer kullanarak user'ı bul
    const user = await findUserByRefreshToken(refreshToken);

    if (!user) {
      res
        .status(401)
        .json({ message: "Invalid refresh token - not found in database" });
      return;
    }

    // JWT token'ı verify et
    const decoded = verifyToken(refreshToken, refreshTokenSecret) as JwtPayload;

    if (!decoded || decoded.id !== user.id) {
      res
        .status(401)
        .json({ message: "Invalid refresh token - JWT verification failed" });
      return;
    }

    // Yeni tokenlar generate et
    const accessToken = generateAccessToken({
      id: decoded.id,
      role: decoded.role,
    });

    const newRefreshToken = generateRefreshToken({
      id: decoded.id,
    });

    // Service layer kullanarak yeni refresh token'ı DB'ye kaydet
    await updateRefreshToken(user.id, newRefreshToken);

    // Yeni refresh token'ı cookie'ye set et
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
    console.log("Refresh token error:", error);
    res.status(401).json({ message: "Invalid refresh token" });
    return;
  }
};

/*
TODO
error handling middleware
*/
