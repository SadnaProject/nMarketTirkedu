import { beforeEach, describe, expect, it } from "vitest";
import { PaymentAdapter } from "./PaymentAdaptor";

describe("handShake", () => {
  it("should return the handshake", async () => {
    await expect(PaymentAdapter.handShake()).resolves.not.toThrow();
  });
});

describe("pay", () => {
  it("should return a random transaction id", async () => {
    const creditCard = {
      number: "1234567890123456",
      month: "12",
      year: "2022",
      holder: "John Doe",
      ccv: "123",
      id: "1234567890123456",
    };
    const ret = await PaymentAdapter.pay(creditCard, 123);
    console.log(ret);
    await expect(PaymentAdapter.pay(creditCard, 123)).resolves.toBeGreaterThan(
      0
    );
  });
});

describe("cancelPayment", () => {
  it("should return the cancel payment", async () => {
    const creditCard = {
      number: "1234567890123456",
      month: "12",
      year: "2022",
      holder: "John Doe",
      ccv: "123",
      id: "1234567890123456",
    };
    const transactionId = await PaymentAdapter.pay(creditCard, 123);
    await expect(
      PaymentAdapter.cancelPayment(transactionId.toString())
    ).resolves.not.toThrow();
  });
});
