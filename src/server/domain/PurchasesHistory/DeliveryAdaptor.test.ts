import { beforeEach, describe, expect, it } from "vitest";
import { DeliveryAdaptor } from "./DeliveryAdaptor";

describe("handShake", () => {
  it("should return the handshake", async () => {
    await expect(DeliveryAdaptor.handShake()).resolves.not.toThrow();
  });
});

describe("supply", () => {
  it("should return a random transaction id", async () => {
    const deliveryDetails = {
      name: "John Doe",
      address: "123 Main St",
      city: "New York",
      country: "USA",
      zip: "12345",
    };
    await expect(
      DeliveryAdaptor.supply(deliveryDetails)
    ).resolves.toBeGreaterThan(0);
  });
});

describe("cancelSupply", () => {
  it("should return the cancel supply", async () => {
    const deliveryDetails = {
      name: "John Doe",
      address: "123 Main St",
      city: "New York",
      country: "USA",
      zip: "12345",
    };
    const transactionId = await DeliveryAdaptor.supply(deliveryDetails);
    await expect(
      DeliveryAdaptor.cancelSupply(transactionId.toString())
    ).resolves.not.toThrow();
  });
});
