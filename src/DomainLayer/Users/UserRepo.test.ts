import { describe , expect, it } from "vitest";
import { randomUUID } from "crypto";
import { UserRepo } from "./UserRepo";
describe("add user", () => {
    it("should add a user to the repo", () => {
        const userRepo = new UserRepo();
        const userId = randomUUID();
        userRepo.addUser(userId);
        expect(userRepo.isUserExist(userId)).toBe(true);
    });
    it("should throw an error if the user already exists", () => {
        const userRepo = new UserRepo();
        const userId = randomUUID();
        userRepo.addUser(userId);
        expect(() => userRepo.addUser(userId)).toThrow();
    });
    }
);
describe("get user", () => {
    it("should return the user", () => {
        const userRepo = new UserRepo();
        const userId = randomUUID();
        userRepo.addUser(userId);
        expect(userRepo.getUser(userId)).toBeDefined();
    });
    it("should throw an error if the user does not exist", () => {
        const userRepo = new UserRepo();
        const userId = randomUUID();
        expect(() => userRepo.getUser(userId)).toThrow();
    });
    }
);
describe("remove user", () => {
    it("should remove the user", () => {
        const userRepo = new UserRepo();
        const userId = randomUUID();
        userRepo.addUser(userId);
        userRepo.removeUser(userId);
        expect(userRepo.isUserExist(userId)).toBe(false);
    });
    it("should throw an error if the user does not exist", () => {
        const userRepo = new UserRepo();
        const userId = randomUUID();
        expect(() => userRepo.removeUser(userId)).toThrow();
    });
    }
);
describe("get all users", () => {
    it("should return all users", () => {
        const userRepo = new UserRepo();
        const userId = randomUUID();
        const userId2 = randomUUID();
        userRepo.addUser(userId);
        userRepo.addUser(userId2);
        expect(userRepo.getAllUsers().length).toBe(2);
    });
    }
);