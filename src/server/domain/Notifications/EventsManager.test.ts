import { beforeEach, describe, expect, it } from "vitest";
import { EventManager } from "./EventsManager";

let eventManager: EventManager;
const purchaseChannel = "storePurchase_123";

beforeEach(() => {
  eventManager = new EventManager();
});

describe("subscribing to events", () => {
  it("should recieve notification", async () => {
    let counter = 0;
    eventManager.subscribeUser("userId", (event) => counter++);
    eventManager.subscribeChannel(purchaseChannel, "userId");
    await eventManager.emitEvent({
      channel: purchaseChannel,
      type: "storePurchase",
      storeId: "123",
      message: "You have a new purchase!",
    });
    expect(counter).toBe(1);
  });
  it("should recieve two notifications", async () => {
    let counter = 0;
    eventManager.subscribeUser("userId", (event) => counter++);
    eventManager.subscribeChannel(purchaseChannel, "userId");
    await eventManager.emitEvent({
      channel: purchaseChannel,
      type: "storePurchase",
      storeId: "123",
      message: "You have a new purchase!",
    });
    await eventManager.emitEvent({
      channel: purchaseChannel,
      type: "storePurchase",
      storeId: "123",
      message: "You have a new purchase!",
    });
    expect(counter).toBe(2);
  });
  it("should not recieve notifications not subscribed to", async () => {
    let counter = 0;
    eventManager.subscribeUser("userId", (event) => counter++);
    const purchaseChannel2 = "storePurchase_12";
    eventManager.subscribeChannel(purchaseChannel, "userId");
    await eventManager.emitEvent({
      channel: purchaseChannel2,
      type: "storePurchase",
      storeId: "12",
      message: "You have a new purchase!",
    });
    expect(counter).toBe(0);
  });
});
