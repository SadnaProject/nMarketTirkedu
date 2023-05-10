import { censored } from "../_Loggable";

export class PaymentAdapter {
  static pay(@censored creditCard: CreditCard, price: number): boolean {
    return true;
  }
}

export type CreditCard = {
  number: string;
};
