import { TRPCError } from "@trpc/server";
import { ZodError, z } from "zod";

// server caller does not format errors, so we need to do it ourselves
export default async function zConvert<T>(f: () => Promise<T>) {
  try {
    return await f();
  } catch (e) {
    const res = z.object({ cause: z.instanceof(ZodError) }).safeParse(e);
    if (res.success) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: res.data.cause.errors[0]?.message,
      });
    }
    throw e;
  }
}
