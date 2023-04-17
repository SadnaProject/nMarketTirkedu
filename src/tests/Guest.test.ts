import { faker } from "@faker-js/faker/locale/en";
import { throws } from "assert";
import { beforeEach } from "vitest";
import { describe, expect, it } from "vitest";
import { Service } from "~/ServiceLayer/Service";

let service: Service;
beforeEach(() => {
  service = new Service();
});

describe("Guest Entrance", () => {
  it("✅ Guest enters the system", () => {
    const id = service.startSession();
    expect(service.isConnected(id)).toBe(true);
    expect(service.isGuest(id)).toBe(true);
    expect(service.getCart(id).storeIdToBasket.size).toBe(0);
  });
});

describe("Disconnection", () => {
  it("✅ Guest disconnects the system", () => {
    const id = service.startSession();
    service.disconnectUser(id);
    expect(!service.isConnected(id)).toBe(true);
  });
  it("✅ Member disconnects the system", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    service.disconnectUser(uid);
    expect(!service.isConnected(uid)).toBe(true);
  });
});

describe("Guest Registration", () => {
  it("✅ Registration of new member", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    expect(service.isMember(uid)).toBe(true);
  });
  it("❎ Registration of an existing member", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    expect(() => service.registerMember(id, email, password)).toThrow();
  });
});

describe("Guest Login", () => {
  it("✅ Login of a registered member", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    expect(service.isMember(uid) && service.isConnected(uid)).toBe(true);
  });
  it("❎ Login using wrong email", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    expect(() => service.loginMember(id, "", password)).toThrow();
  });
  it("❎ Login using wrong password", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    expect(() => service.loginMember(id, email, "")).toThrow();
  });
});
