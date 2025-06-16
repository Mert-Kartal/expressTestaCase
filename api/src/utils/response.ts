export const errorResponse = (message: string, errors?: any[]) => ({
  status: "error",
  message,
  ...(errors && { errors }),
});
