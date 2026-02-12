import { io } from "socket.io-client";

const url =
  import.meta.env.VITE_API_SOCKET_URL_PROD ||
  import.meta.env.VITE_API_SOCKET_URL;

export const socket = io(url, { autoConnect: true, withCredentials: true });
