import { type Basket } from "./Basket";

export class Cart {
  private baskets: Basket[];

  constructor() {
    this.baskets = [];
  }
}
