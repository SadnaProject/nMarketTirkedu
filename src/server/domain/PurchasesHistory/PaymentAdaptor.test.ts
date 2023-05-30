import { beforeEach, describe, expect, it } from "vitest";
import { PaymentAdapter } from "./PaymentAdaptor";

describe("handShake", () => {
  it("should return the handshake", () => {
    expect(async () => {
      await PaymentAdapter.handShake();
    }).not.toThrow();
  });
});
