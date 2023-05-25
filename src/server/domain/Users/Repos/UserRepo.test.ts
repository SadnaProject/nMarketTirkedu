import { describe, expect, it } from "vitest";
import { randomUUID } from "crypto";
import { UserRepo } from "./UserRepo";
import { TRPCError } from "@trpc/server";
import { PrismaClientValidationError } from "@prisma/client/runtime";
describe("add user", () => {
  it("should add a user to the repo", async () => {
    const userRepo = new UserRepo();
    const userId = randomUUID();
    await userRepo.addUser(userId);
    expect(await userRepo.isUserExist(userId)).toBe(true);
  });
  it("should throw an error if the user already exists", async () => {
    const userRepo = new UserRepo();
    const userId = randomUUID();
    await userRepo.addUser(userId);
    await expect(() => userRepo.addUser(userId)).rejects.toThrow(TRPCError);
  });
});
describe("get user", () => {
  it("should return the user", async () => {
    const userRepo = new UserRepo();
    const userId = randomUUID();
    await userRepo.addUser(userId);
    expect(await userRepo.getUser(userId)).toBeDefined();
  });
  it("should throw an error if the user does not exist", async () => {
    const userRepo = new UserRepo();
    const userId = randomUUID();
    await expect(() => userRepo.getUser(userId)).rejects.toThrow(TRPCError);
  });
});
describe("remove user", () => {
  it("should remove the user", async () => {
    const userRepo = new UserRepo();
    const userId = randomUUID();
    await userRepo.addUser(userId);
    await userRepo.removeUser(userId);
    expect(await userRepo.isUserExist(userId)).toBe(false);
  });
  it("should throw an error if the user does not exist", async () => {
    const userRepo = new UserRepo();
    const userId = randomUUID();
    await expect(async () => await userRepo.removeUser(userId)).rejects.toThrow(
      TRPCError
    );
  });
});
describe("get all users", () => {
  it("should return all users", async () => {
    const userRepo = new UserRepo();
    const userId = randomUUID();
    const userId2 = randomUUID();
    await userRepo.addUser(userId);
    await userRepo.addUser(userId2);
    expect((await userRepo.getAllUsers()).length).toBe(2);
  });
});
