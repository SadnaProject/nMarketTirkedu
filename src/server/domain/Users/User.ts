import { getDB } from "server/helpers/_Transactional";
import { Cart, type ExtendedCartDTO, type CartDTO } from "./Cart";
import { Notification } from "./Notification";
import { TRPCError } from "@trpc/server";
import { string } from "zod";

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
    const dtos = getDB().notification.findMany({
      where: { userId: this.id },
    });
    this.notifications = (await dtos).map((dto) =>
      Notification.createFromDTO(dto)
    );
    return (await dtos).map((dto) => Notification.createFromDTO(dto));
  }
  public async addNotification(notification: Notification, isOnline: boolean): Promise<void> {
    this.notifications.push(notification);
    await getDB().notification.create({
      data: {
        userId: this.id,
        id: notification.Id,
        type: notification.Type,
        message: notification.Message,
        isRead: isOnline,
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
      const n = await getDB().notification.findUnique({
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
    await getDB().cart.delete({ where: { userId: this.id } });
    await getDB().cart.create({
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
    const products = await getDB().basketProduct.findMany({
      where: { userId: dto.id },
    });
    //fix bids later
    const bidsFromMe = await getDB().bid.findMany({
      where: { userId: dto.id },
    });
    const bidsToMe = await getDB().bid.findMany();
    const stores = new Set(products.map((p) => p.storeId));
    u.cart = await Cart.createFromArgs(u.Id, Array.from(stores));
    u.bidsFromMe = bidsFromMe.map((b) => b.id);
    u.bidsToMe = [];
    for (const bid of bidsToMe) {
      if (bid.owners.includes(dto.id)) {
        u.bidsToMe.push(bid.id);
      }
    }

    return u;
  }
  public async getCartUI(): Promise<ExtendedCartDTO> {
    const products = await getDB().basketProduct.findMany({
      where: { userId: this.id },
    });
    const stores = new Set(products.map((p) => p.storeId));
    const cart = await Cart.createFromArgsUI(this.id, Array.from(stores));
    return cart;
  }
}
