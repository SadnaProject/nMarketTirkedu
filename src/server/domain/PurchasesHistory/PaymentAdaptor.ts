import { TRPCError } from "@trpc/server";
import { censored } from "../_Loggable";
import fetch from "node-fetch";

export class PaymentAdapter {
  //send HTTP post request to the payment service at https://php-server-try.000webhostapp.com/
  static async handShake() {
    const response = await fetch("https://php-server-try.000webhostapp.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action_type: "handshake",
      }),
    });
    console.log(await response.text()); // supposed to return OK, clearly doesn't
    if (!response.ok)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Payment service is not available",
      });
  }

  static async pay(@censored paymentDetails: PaymentDetails, price: number) {
    const response = await fetch("https://php-server-try.000webhostapp.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action_type: "pay",
        card_number: paymentDetails.number,
        month: paymentDetails.month,
        year: paymentDetails.year,
        holder: paymentDetails.holder,
        ccv: paymentDetails.ccv,
        id: paymentDetails.id,
      }),
    });
    console.log(await response.text());
    if (!response.ok)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Payment service is not available",
      });
    return response.json() as Promise<number>;
  }

  static async cancelPayment(transactionId: string) {
    const response = await fetch("https://php-server-try.000webhostapp.com/", {
      method: "POST",
      body: JSON.stringify({
        action_type: "cancel_pay",
        transaction_id: transactionId,
      }),
    });
    if (!response.ok)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Payment service is not available",
      });
    return response.json();
  }
}
export type PaymentDetails = {
  number: string;
  month: string;
  year: string;
  holder: string;
  ccv: string;
  id: string;
};
