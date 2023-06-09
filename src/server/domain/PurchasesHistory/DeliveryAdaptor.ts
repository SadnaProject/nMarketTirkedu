import { TRPCError } from "@trpc/server";
import fetch from "node-fetch";
import { getHost } from "../helpers/hostname";
import { z } from "zod";

export class DeliveryAdaptor {
  static isDeliveryServiceUp = false;
  static async handShake() {
    if (!this.isDeliveryServiceUp) {
      return;
    }
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

  static async supply(deliveryDetails: DeliveryDetails): Promise<number> {
    if (!this.isDeliveryServiceUp) {
      //return a random transaction id
      return Math.floor(Math.random() * 1000000000);
    }
    const body = `action_type=supply&name=${deliveryDetails.name}&address=${deliveryDetails.address}&city=${deliveryDetails.city}&country=${deliveryDetails.country}&zip=${deliveryDetails.zip}`;
    const res = await fetch(
      `${getHost()}/api/external?method=POST&body=action_type=${encodeURIComponent(
        body
      )}`
    );
    const txt = await res.text();
    const data = this.parseStringFromPaymentService(txt);
    if (data === "-1") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "supply failed",
      });
    }
    return Number(data);
  }
  static async cancelSupply(transactionId: string) {
    if (!this.isDeliveryServiceUp) {
      return;
    }
    const body = `action_type=cancel_supply&transaction_id=${transactionId}`;
    const res = await fetch(
      `${getHost()}/api/external?method=POST&body=action_type=${encodeURIComponent(
        body
      )}`
    );
    const txt = await res.text();
    const data = this.parseStringFromPaymentService(txt);
    if (data !== "1") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "cancel supply failed",
      });
    }
  }
}

export type DeliveryDetails = {
  name: string;
  address: string;
  city: string;
  country: string;
  zip: string;
};
