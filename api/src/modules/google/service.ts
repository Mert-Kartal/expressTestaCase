import axios from "axios";
import {
  google_client_id,
  google_client_secret,
  google_redirect_uri,
} from "../../config/data";
import { GoogleTokenResponse } from "./types";
import { AppError } from "../../utils/appError";

export function getGoogleAuthURL() {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    client_id: google_client_id,
    redirect_uri: google_redirect_uri,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };
  const params = new URLSearchParams(options).toString();
  return `${rootUrl}?${params}`;
}

export async function getGoogleOAuthToken(
  code: string
): Promise<GoogleTokenResponse> {
  const url = "https://oauth2.googleapis.com/token";
  const options = {
    code,
    client_id: google_client_id,
    client_secret: google_client_secret,
    redirect_uri: google_redirect_uri,
    grant_type: "authorization_code",
  };

  try {
    const response = await axios.post<GoogleTokenResponse>(
      url,
      new URLSearchParams(options),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new AppError(error.message, 500);
  }
}
