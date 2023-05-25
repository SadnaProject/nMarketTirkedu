import { Cart, type CartDTO } from "./Cart";
import { Notification } from "./Notification";
import { TRPCError } from "@trpc/server";
import { db } from "server/db";
export class User {
  private id: string;
  private notifications: Notification[];
  private cart: Cart;
  private bidsFromMe: string[] = [];
  private bidsToMe: string[] = [];
  constructor(id: string) {
    this.id = id;
    this.notifications = [];
    this.cart = new Cart(id);
  }

  public get Id(): string {
    return this.id;
  }

  public get Notifications(): Notification[] {
    return this.notifications;
  }
  public async getUpdatedNotifications(): Promise<Notification[]> {
    const dtos = db.notification.findMany({
      where: { userId: this.id },
    });
    this.notifications = (await dtos).map((dto) =>
      Notification.createFromDTO(dto)
    );
    return (await dtos).map((dto) => Notification.createFromDTO(dto));
  }
  public async addNotification(notification: Notification): Promise<void> {
    this.notifications.push(notification);
    await db.notification.create({
      data: {
        userId: this.id,
        id: notification.Id,
        type: notification.Type,
        message: notification.Message,
        isRead: notification.IsRead,
      },
    });
  }
  public get Cart(): CartDTO {
    return this.cart.DTO;
  }
  public async addProductToCart(
    productId: string,
    quantity: number,
    storeId: string
  ): Promise<void> {
    await this.cart.addProduct(productId, storeId, quantity);
  }
  public async removeProductFromCart(
    productId: string,
    storeId: string
  ): Promise<void> {
    await this.cart.removeProduct(productId, storeId);
  }
  public async editProductQuantityInCart(
    productId: string,
    storeId: string,
    quantity: number
  ): Promise<void> {
    await this.cart.editProductQuantity(productId, storeId, quantity);
  }
  public async readNotification(notificationId: string): Promise<void> {
    let notification = this.notifications.find(
      (notification) => notification.Id === notificationId
    );
    if (notification === undefined) {
      const n = await db.notification.findUnique({
        where: { id: notificationId },
      });
      if (n == null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The requested notification not found",
        });
      }
      notification = Notification.createFromDTO(n);
      this.notifications.push(notification);
    }
    await notification.read();
  }
  public async clearCart(): Promise<void> {
    this.cart = new Cart(this.id);
    await db.cart.delete({ where: { userId: this.id } });
    await db.cart.create({
      data: {
        userId: this.id,
      },
    });
  }
  public async clone(user: User): Promise<void> {
    await this.getUpdatedNotifications();
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
  public get BidsFromMe(): string[] {
    return this.bidsFromMe;
  }
  public get BidsToMe(): string[] {
    return this.bidsToMe;
  }
  static async UserFromDTO(dto: { id: string }): Promise<User> {
    const u = new User(dto.id);
    const products = await db.basketProduct.findMany({
      where: { userId: dto.id },
    });
    //fix bids later
    const stores = new Set(products.map((p) => p.storeId));
    u.cart = await Cart.createFromArgs(u.Id, Array.from(stores));
    return u;
  }
}
