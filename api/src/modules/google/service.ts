export const google_client_id = process.env.GOOGLE_CLIENT_ID!;
export const google_client_secret = process.env.GOOGLE_CLIENT_SECRET!;
export const google_redirect_uri = process.env.GOOGLE_REDIRECT_URI!;

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
