import { Cart, type CartDTO } from "./Cart";
import { type Notification } from "./Notification";

export class User {
  private id: string;
  private notifications: Notification[];
  private cart: Cart;

  constructor(id: string) {
    this.id = id;
    this.notifications = [];
    this.cart = new Cart();
  }

  public get Id(): string {
    return this.id;
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
  public addProductToCart(
    productId: string,
    quantity: number,
    storeId: string
  ): void {
    this.cart.addProduct(productId, storeId, quantity);
  }
  public removeProductFromCart(productId: string, storeId: string): void {
    this.cart.removeProduct(productId, storeId);
  }
  public editProductQuantityInCart(
    productId: string,
    storeId: string,
    quantity: number
  ): void {
    this.cart.editProductQuantity(productId, storeId, quantity);
  }
  public readNotification(notificationId: string): void {
    const notification = this.notifications.find(
      (notification) => notification.Id === notificationId
    );
    if (notification === undefined) {
      throw new Error("Notification not found");
    }
    notification.read();
  }
  public clearCart(): void {
    this.cart = new Cart();
  }
  public clone(user: User): void {
    this.notifications = user.notifications;
    this.cart = user.cart;
  }
}