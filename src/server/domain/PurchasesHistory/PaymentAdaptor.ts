import { TRPCError } from "@trpc/server";
import { censored } from "../_Loggable";
import fetch from "node-fetch";
import { getHost } from "server/helpers/hostname";
import { z } from "zod";

export class PaymentAdapter {
  //send HTTP post request to the payment service at https://php-server-try.000webhostapp.com/
  static async handShake() {
    const res = await fetch(
      `${getHost()}/api/external?method=POST&body=action_type=handshake`
    );
    const txt = await res.text();
    const data = this.parseStringFromPaymentService(txt);
    if (data !== "OK") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "handshake failed",
      });
    }
  }

  static parseStringFromPaymentService(str: string) {
    const data = z.object({ data: z.string() }).parse(JSON.parse(str)).data;
    return data;
  }

  static async pay(
    @censored paymentDetails: PaymentDetails,
    price: number
  ): Promise<number> {
    const res = await fetch(
      `${getHost()}/api/external?method=POST&body=action_type=pay&card_number=${
        paymentDetails.number
      }&month=${paymentDetails.month}&year=${paymentDetails.year}&holder=${
        paymentDetails.holder
      }&ccv=${paymentDetails.ccv}&id=${paymentDetails.id}`
    );
    const txt = await res.text();
    const data = this.parseStringFromPaymentService(txt);
    if (data === "-1") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "payment failed",
      });
    }
    return Number(data);
  }

  static async cancelPayment(transactionId: string) {
    const res = await fetch(
      `${getHost()}/api/external?method=POST&body=action_type=cancel_pay&transaction_id=${transactionId}`
    );
    const txt = await res.text();
    const data = this.parseStringFromPaymentService(txt);
    if (data !== "1") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "cancel payment failed",
      });
    }
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
