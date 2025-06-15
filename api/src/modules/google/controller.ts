import { Request, Response } from "express";
import { getGoogleAuthURL, getGoogleOAuthToken } from "./service";
import {
  createUser,
  findUserByRefreshToken,
  updateRefreshToken,
  logoutUser,
  getUser,
  setUserRole,
} from "../user/service";
import {
  decodeGoogleIdToken,
  generateTokenPair,
  verifyToken,
} from "../../utils/auth";
import { GoogleUserDecodeType } from "./types";
import { refreshTokenSecret } from "../../config/data";
import { JwtPayload } from "jsonwebtoken";

export const googleAuthController = (req: Request, res: Response) => {
  try {
    const url = getGoogleAuthURL();
    res.redirect(url);
  } catch (error) {
    console.log("Error during google auth:", error);
    res.redirect("http://localhost:3000");
  }
};

export const googleAuthCallbackController = async (
  req: Request<{}, {}, {}, { code: string }>,
  res: Response
) => {
  const code = req.query.code;
  try {
    if (!code) {
      res.status(400).json({ message: "No code provided" });
      return;
    }

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

    // if (user.isRoleSet === false) {
    // TODO: role seçimi ekranına yolla
    //   res.redirect("http://localhost:3000/api/auth/role");
    //   return;
    // }

    res.status(200).json({
      data: user,
    });
  } catch (error: any) {
    console.log("ERROR:", error);
    res.redirect("http://localhost:3000");
  }
};

export const googleLogoutController = async (req: Request, res: Response) => {
  console.log("cookies:", req.cookies);

  const refreshToken = req.cookies?.refreshToken;

  try {
    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    });

    res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    console.log("Error during logout:", error);
  }
};

export const googleRefreshController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token missing" });
    return;
  }

  try {
    //düzenle bu kısmı service ile
    const user = await findUserByRefreshToken(refreshToken);

    if (!user) {
      res
        .status(401)
        .json({ message: "Invalid refresh token - not found in database" });
      return;
    }

    const decoded = verifyToken(refreshToken, refreshTokenSecret) as JwtPayload;

    if (!decoded || decoded.id !== user.id) {
      res
        .status(401)
        .json({ message: "Invalid refresh token - JWT verification failed" });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(
      user.id,
      user.role
    );

    await updateRefreshToken(user.id, newRefreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

export const googleRoleController = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const user = await getUser(userId);
  const role = req.body.role;
  if (!role) {
    res.status(400).json({ message: "Role is required" });
    return;
  }
  if (user?.isRoleSet) {
    res.status(400).json({ message: "User already has a role" });
    return;
  }

  if (role !== "STUDENT" && role !== "TEACHER") {
    res.status(400).json({ message: "Invalid role" });
    return;
  }

  await setUserRole(userId, role);
  res.status(200).json({ message: "Role updated successfully" });
};

/*
TODO
error handling middleware
*/
