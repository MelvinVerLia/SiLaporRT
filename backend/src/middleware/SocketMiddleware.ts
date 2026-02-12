import { verifyJWT } from "../utils/VerifyJWT";

export function socketAuth(socket: any, next: any) {
  try {
    const cookieHeader = socket.request.headers.cookie;
    if (!cookieHeader) return next(new Error("Unauthorized"));

    const cookies = parseCookies(cookieHeader);
    if (!cookies.refresh_token) return next(new Error("Unauthorized"));

    const access_token = cookies.access_token;

    const user = verifyJWT(access_token);

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
}

function parseCookies(cookieHeader: string) {
  return Object.fromEntries(cookieHeader.split("; ").map((c) => c.split("=")));
}
