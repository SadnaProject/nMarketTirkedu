import { TRPCError } from "@trpc/server";
import { describe, expect, it, vi } from "vitest";
import { StringFactory } from "~/server/api/routers/users";
import { trpcRequest } from "~/server/helpers/trpcRequest";

//* Vitest Docs: https://vitest.dev/api

describe("secret message", () => {
  it("should throw an error if not logged in", async () => {
    await expect(() => trpcRequest().user.getSecretMessage()).rejects.toThrow(
      new TRPCError({
        code: "UNAUTHORIZED",
      })
    );
  });

  it("should return the secret", async () => {
    const result = await trpcRequest({
      id: "1",
      username: "test",
    }).user.getSecretMessage();
    expect(result).toBe("Your username is test");
  });

  it("should return a mocked secret decoration", async () => {
    const mock = vi.fn();
    mock.mockReturnValue("!");
    StringFactory.prototype.getSecretMessageDecoration = mock;

    const result = await trpcRequest({
      id: "1",
      username: "test",
    }).user.getSecretMessage();
    expect(result).toBe("Your username is test!");

    expect(mock).toHaveBeenCalled();
  });
});
