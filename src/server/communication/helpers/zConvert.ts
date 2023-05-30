import { TRPCError } from "@trpc/server";
import { ZodError, z } from "zod";

// server caller does not format errors, so we need to do it ourselves
export default async function zConvert<T>(f: () => Promise<T>) {
  try {
    return await f();
  } catch (e) {
    const res1 = z.object({ cause: z.instanceof(ZodError) }).safeParse(e);
    if (res1.success) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: res1.data.cause.errors[0]?.message,
      });
    }
    const res2 = z.instanceof(ZodError).safeParse(e);
    if (res2.success) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: res2.data.errors[0]?.message,
      });
    }
    throw e;
  }
}
