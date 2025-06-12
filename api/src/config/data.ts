export const google_client_id = process.env.GOOGLE_CLIENT_ID!;
export const google_client_secret = process.env.GOOGLE_CLIENT_SECRET!;
export const google_redirect_uri = process.env.GOOGLE_REDIRECT_URI!;
export const accessTokenSecret =
  process.env.JWT_ACCESS_KEY || "accessTokenSecret";
export const refreshTokenSecret =
  process.env.JWT_REFRESH_KEY || "refreshTokenSecret";
