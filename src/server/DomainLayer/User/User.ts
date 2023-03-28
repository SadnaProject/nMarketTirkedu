import { Cart } from "./Cart";
import { type Notification } from "./Notification";

export type UserArgs = {
  name: string;
  email: string;
  password: string;
};

export class User {
  private id: string;
  private name: string;
  private email: string;
  private password: string;
  private notifications: Notification[];
  private cart: Cart;

  constructor({ name, email, password }: UserArgs) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.email = email;
    this.password = password;
    this.notifications = [];
    this.cart = new Cart();
  }
}
