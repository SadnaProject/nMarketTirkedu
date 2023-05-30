import NextAuth from "next-auth";
import { authOptions } from "server/communication/auth";

export default NextAuth(authOptions);
