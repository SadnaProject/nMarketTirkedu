import { Cart } from "./Cart";
import { type Notification } from "./Notification";

export type UserArgs = {
  id: string;
  name: string;
};

export type UserDTO = {
  id: string;
  name: string;
};

export class User {
  private id: string;
  private name: string;
  private notifications: Notification[];
  private cart: Cart;

  constructor({ id, name }: UserArgs) {
    this.id = id;
    this.name = name;

    this.notifications = [];
    this.cart = new Cart();
  }

  public get Id(): string {
    return this.id;
  }

  public get Name(): string {
    return this.name;
  }
}
