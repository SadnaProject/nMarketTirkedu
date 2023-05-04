export class PaymentAdapter {
  static pay(creditCard: CreditCard, price: number): boolean {
    return true;
  }
}

export type CreditCard = {
  number: string;
};
