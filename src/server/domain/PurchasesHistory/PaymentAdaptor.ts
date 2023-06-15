import { TRPCError } from "@trpc/server";
import { getHost } from "../helpers/hostname";
import fetch from "node-fetch";
import { z } from "zod";
import axios from "axios";

export class PaymentAdapter {
  static isPaymentServiceUp = true;
  static url = "http://127.0.0.1:5000/";
  // send HTTP post request to the payment service at https://php-server-try.000webhostapp.com/
  static async handShake() {
    if (!this.isPaymentServiceUp) {
      return;
    }
    const requestData = {
      action_type: "handshake",
    };
    try {
      const response = await axios.post(PaymentAdapter.url, requestData);
      const data = response.data as string;
      if (data !== "OK") {
        throw new Error("handshake failed");
      }
    } catch (error) {
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
    paymentDetails: PaymentDetails,
    price: number
  ): Promise<number> {
    if (!this.isPaymentServiceUp) {
      //return a random transaction id
      return Math.floor(Math.random() * 1000000000);
    }

    const requestData = {
      action_type: "pay",
      card_number: paymentDetails.number,
      month: paymentDetails.month,
      year: paymentDetails.year,
      holder: paymentDetails.holder,
      ccv: paymentDetails.ccv,
      id: paymentDetails.id,
    };
    try {
      const response = await axios.post(PaymentAdapter.url, requestData);
      const data = response.data as string;
      if (data === "-1") {
        throw new Error("payment failed");
      }
      return Number(data);
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "payment failed",
      });
    }
  }

  static async cancelPayment(transactionId: string) {
    if (!this.isPaymentServiceUp) {
      return;
    }
    const requestData = {
      action_type: "cancel_pay",
      transaction_id: transactionId,
    };
    try {
      const response = await axios.post(PaymentAdapter.url, requestData);
      const data = response.data as number;
      if (data !== 1) {
        throw new Error("cancel payment failed");
      }
      return data;
    } catch (error) {
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
