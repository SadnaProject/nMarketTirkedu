import { faker } from "@faker-js/faker/locale/en";
import { Service } from "server/service/Service";
import { describe, expect, it, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { resetDB } from "server/helpers/_Transactional";
let service: Service;
beforeEach(async () => {
  await resetDB();
  service = new Service();
});
//Use Case 1.1
describe("Guest Entrance", () => {
  it("✅ Guest enters the system", async () => {
    const id = await service.startSession();
    expect(await service.isConnected(id)).toBe(true);
    expect(service.isGuest(id)).toBe(true);
    expect((await service.getCart(id)).storeIdToBasket.size).toBe(0);
  });
});
//Use Case 1.2
describe("Disconnection", () => {
  it("✅ Guest disconnects the system", async () => {
    const id = await service.startSession();
    await service.disconnectUser(id);
    expect(!(await service.isConnected(id))).toBe(true);
  });
  it("✅ Member disconnects the system", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    await service.disconnectUser(uid);
    // expect(!service.isConnected(uid)).toBe(true);
  });
});
//Use Case 1.3
describe("Guest Registration", () => {
  it("✅ Registration of new member", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    expect(await service.isMember(uid)).toBe(true);
  });
  it("❎ Registration of an existing member", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    await expect(() =>
      service.registerMember(id, email, password)
    ).rejects.toThrow(
      "Email already in use, please try again with a different email"
    );
  });
});
//Use Case 1.4
describe("Guest Login", () => {
  it("✅ Login of a registered member", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    expect(
      (await service.isMember(uid)) && (await service.isConnected(uid))
    ).toBe(true);
  });
  it("❎ Login using wrong email", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    await expect(() => service.loginMember(id, "", password)).rejects.toThrow(
      TRPCError
    );
  });
  it("❎ Login using wrong password", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    await expect(() => service.loginMember(id, email, "")).rejects.toThrow(
      "Password is incorrect, please try again with a different password"
    );
  });
});
