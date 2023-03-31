export type StoreProductArgs = {
  name: string;
  quantity: number;
  price: number;
};

export type StoreProductDTO = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export class StoreProduct {
  private id: string;
  private name: string;
  private quantity: number;
  private price: number;

  constructor({name, quantity, price}: StoreProductArgs) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.quantity = quantity;
    this.price = price;
  }
}


