import { Bid } from "./Bid";
import { Cart, type CartDTO } from "./Cart";
import { type Notification } from "./Notification";
import { TRPCError } from "@trpc/server";
export class User {
  private id: string;
  private notifications: Notification[];
  private cart: Cart;
  private bidsFromMe: string[] = [];
  private bidsToMe: string[] = [];
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
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested notification not found",
      });
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
  public addBidToMe(bidId: string): void {
    if (this.bidsToMe.includes(bidId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Bid already exists",
      });
    }
    this.bidsToMe.push(bidId);
  }
  public addBidFromMe(bidId: string): void {
    if (this.bidsFromMe.includes(bidId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Bid already exists",
      });
    }
    this.bidsFromMe.push(bidId);
  }

  public isBidExistFromMe(bidId: string): boolean {
    return this.bidsFromMe.includes(bidId);
  }
  public isBidExistToMe(bidId: string): boolean {
    return this.bidsToMe.includes(bidId);
  }
}
