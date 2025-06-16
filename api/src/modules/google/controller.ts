import { Request, Response, NextFunction } from "express";
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
import { AppError } from "../../utils/appError";

export const googleAuthController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const url = getGoogleAuthURL();
    res.redirect(url);
  } catch (error) {
    next(new AppError("Failed to get Google auth URL", 500));
  }
};

export const googleAuthCallbackController = async (
  req: Request<{}, {}, {}, { code: string }>,
  res: Response,
  next: NextFunction
) => {
  const code = req.query.code;
  try {
    if (!code) {
      return next(new AppError("No code provided", 400));
    }

    const { id_token } = await getGoogleOAuthToken(code);
    const googleUser: GoogleUserDecodeType = decodeGoogleIdToken(
      id_token
    ) as GoogleUserDecodeType;

    if (!googleUser) {
      return next(
        new AppError("Failed to decode Google user information", 400)
      );
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

    if (user.isRoleSet === false) {
      res.redirect("http://localhost:3000/api/auth/role");
      return;
    }

    res.status(200).json({
      data: user,
    });
  } catch (error: any) {
    next(new AppError("Authentication process failed", 500));
  }
};

export const googleLogoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    next(new AppError("Logout failed", 500));
  }
};

export const googleRefreshController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return next(new AppError("Refresh token missing", 401));
  }

  try {
    const user = await findUserByRefreshToken(refreshToken);

    if (!user) {
      return next(
        new AppError("Invalid refresh token - not found in database", 401)
      );
    }

    const decoded = verifyToken(refreshToken, refreshTokenSecret) as JwtPayload;

    if (!decoded || decoded.id !== user.id) {
      return next(new AppError("Token refresh failed", 401));
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
    next(error);
  }
};

export const googleRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;
  const user = await getUser(userId);
  const role = req.body.role;
  if (!role) {
    return next(new AppError("Role is required", 400));
  }
  if (user?.isRoleSet) {
    return next(new AppError("User already has a role", 400));
  }

  if (role !== "STUDENT" && role !== "TEACHER") {
    return next(new AppError("Invalid role", 400));
  }

  try {
    await setUserRole(userId, role);
    res.status(200).json({ message: "Role updated successfully" });
  } catch (error) {
    next(new AppError("Failed to update user role", 500));
  }
};
