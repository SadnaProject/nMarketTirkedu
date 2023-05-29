import { TRPCError } from "@trpc/server";
import { censored } from "../_Loggable";
import { type } from "os";

export class DeliveryAdaptor {
  static async handShake() {
    const response = await fetch("https://php-server-try.000webhostapp.com/", {
      method: "POST",
      body: JSON.stringify({
        action_type: "handshake",
      }),
    });
    if (!response.ok)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Payment service is not available",
      });
  }
  static async supply(@censored deliveryDetails: DeliveryDetails) {
    const response = await fetch("https://php-server-try.000webhostapp.com/", {
      method: "POST",
      body: JSON.stringify({
        action_type: "supply",
        name: deliveryDetails.name,
        address: deliveryDetails.address,
        city: deliveryDetails.city,
        country: deliveryDetails.country,
        zip: deliveryDetails.zip,
      }),
    });
    if (!response.ok)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Delivery service is not available",
      });
    return response.json() as Promise<number>;
  }
  static async cancelSupply(transactionId: string) {
    const response = await fetch("https://php-server-try.000webhostapp.com/", {
      method: "POST",
      body: JSON.stringify({
        action_type: "cancel_supply",
        transaction_id: transactionId,
      }),
    });
    if (!response.ok)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Delivery service is not available",
      });
    return response.json();
  }
}

export type DeliveryDetails = {
  name: string;
  address: string;
  city: string;
  country: string;
  zip: string;
};
