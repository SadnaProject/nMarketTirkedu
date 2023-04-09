import { Cart, type CartDTO } from "./Cart";
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

  public get Notifications(): Notification[] {
    return this.notifications;
  }
  public addNotification(notification: Notification): void {
    this.notifications.push(notification);
  }
  public get Cart(): CartDTO {
    return this.cart.DTO;
  }
  public addProductToCart(productId: string, quantity: number, storeId:string): void {
    this.cart.addProduct(productId,storeId, quantity);
  }
  public removeProductFromCart(productId: string, storeId:string): void {
    this.cart.removeProduct(productId,storeId);
  }
  public editProductQuantityInCart( productId: string, storeId:string, quantity: number): void {
    this.cart.editProductQuantity(productId,storeId, quantity);
  }
  public readNotification(notificationId:string): void {
    const notification = this.notifications.find((notification) => notification.Id === notificationId);
    if(notification === undefined){
      throw new Error("Notification not found");
    }
    notification.read();
  }
}
