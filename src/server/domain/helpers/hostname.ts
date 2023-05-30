import { env } from "env.mjs";

export function getHost() {
  return process.env.NODE_ENV === "production"
    ? env.HOST
    : "http://localhost:3000";
}
