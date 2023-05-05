import { HasControllers } from "../_HasController";
import { Mixin } from "ts-mixer";
import { type CartDTO } from "./Cart";
import { Notification } from "./Notification";
import { HasRepos, createRepos } from "./_HasRepos";
import { Testable, testable } from "server/domain/_Testable";
import { type CreditCard } from "../PurchasesHistory/PaymentAdaptor";
import { TRPCError } from "@trpc/server";
import { censored } from "../_Loggable";
export interface IUsersController {
  /**
   * This fuction checks if a user exists.
   * @param userId The id of the user that is currently logged in.
   * @returns True if the user exists, false otherwise.
   */
  isUserExist(userId: string): boolean;
  /**
   * This function gets the notifications of a user.
   * @param userId The id of the user that is currently logged in.
   * @returns The notifications of the user.
   */
  getNotifications(userId: string): Notification[];
  /**
   * This function adds a product to a user's cart.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product that is being added to the cart.
   * @param quantity The quantity of the product that is being added to the cart.
   */
  addProductToCart(userId: string, productId: string, quantity: number): void;
  /**
   * This function removes a product from a user's cart.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product that is being removed from the cart.
   * @throws Error if the product is not in the cart.
   */
  removeProductFromCart(userId: string, productId: string): void;
  /**
   * This function edits the quantity of a product in a user's cart.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product that is being edited in the cart.
   * @param quantity The new quantity of the product.
   * @throws Error if the product is not in the cart.
   * @throws Error if the quantity is invalid.
   */
  editProductQuantityInCart(
    userId: string,
    productId: string,
    quantity: number
  ): void;
  /**
   * This function gets the cart of a user.
   * @param userId The id of the user that is currently logged in.
   * @returns The cart of the user.
   */
  getCart(userId: string): CartDTO;
  /**
   * This function purchases the cart of a user.
   * @param userId The id of the user that is currently logged in.
   */
  purchaseCart(userId: string, creditCard: CreditCard): void;
  /**
   * This function adds a user to the system.
   * @param user The user that is being added to the system.
   */
  addUser(userId: string, userName: string): void;
  /**
   * This function removes a user from the system.
   * @param userId The id of the user that is being removed from the system.
   */
  removeUser(userId: string): void;
  /**
   * This function will mark notifications as read.
   * @param userId The id of the user that is currently logged in.
   * @param notificationId The id of the notification that is being marked as read.
   * @throws Error if the notification is not in the user's notifications.
   */
  readNotification(userId: string, notificationId: string): void;
  /**
   * This function will return the user's unread notifications.
   * @param userId The id of the user that is currently logged in.
   * @returns The user's unread notifications.
   * @throws Error if the user is not in the system.
   */
  getUnreadNotifications(userId: string): Notification[];
  /**
   * This function will add notifications to the user's notifications.
   * @param userId The id of the user that is currently logged in.
   * @param notificationType The type of the notification that is being added.
   * @param notificationMsg The message of the notification that is being added.
   * @returns The id of the notification that was added.
   */
  addNotification(
    userId: string,
    notificationType: string,
    notificationMsg: string
  ): string;
  register(email: string, password: string): string;
  /**
   * This function will start new session for user.
   */
  startSession(): string;
  /**
   * This function will end the current session for user.
   * @param userId The id of the user that is currently logged in.
   */
  disconnect(userId: string): void;
  /**
   * This function will logs in the member to the system.
   * @param guestId The id of the guest that is currently logged in.
   * @param email The email of the user that want to login.
   * @param password The password of the user that want to login.
   */
  login(guestId: string, email: string, password: string): string;
  /**
   * This function will logs out the member from the system.
   * @param userId The id of the user that is currently logged in.
   */
  logout(userId: string): string;
}

@testable
export class UsersController
  extends Mixin(Testable, HasControllers, HasRepos)
  implements IUsersController
{
  constructor() {
    super();
    this.initRepos(createRepos());
  }
  getNotifications(userId: string): Notification[] {
    return this.Repos.Users.getUser(userId).Notifications;
  }
  addProductToCart(userId: string, productId: string, quantity: number): void {
    const user = this.Repos.Users.getUser(userId); // notice that we get the user from the repo and not from the system
    const storeId = this.Controllers.Stores.getStoreIdByProductId(
      userId,
      productId
    );
    if (
      !this.Controllers.Stores.isProductQuantityInStock(
        userId,
        productId,
        quantity
      )
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "store don't have such amount of product",
      });
    }
    user.addProductToCart(productId, quantity, storeId);
  }
  removeProductFromCart(userId: string, productId: string): void {
    const user = this.Repos.Users.getUser(userId);
    const storeId = this.Controllers.Stores.getStoreIdByProductId(
      userId,
      productId
    );
    user.removeProductFromCart(productId, storeId);
  }
  editProductQuantityInCart(
    userId: string,
    productId: string,
    quantity: number
  ): void {
    const user = this.Repos.Users.getUser(userId);
    if (
      !this.Controllers.Stores.isProductQuantityInStock(
        userId,
        productId,
        quantity
      )
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "store don't have such amount of product",
      });
    }
    const storeId = this.Controllers.Stores.getStoreIdByProductId(
      userId,
      productId
    );
    user.editProductQuantityInCart(productId, storeId, quantity);
  }
  getCart(userId: string): CartDTO {
    return this.Repos.Users.getUser(userId).Cart;
  }
  purchaseCart(userId: string, @censored creditCard: CreditCard): void {
    const user = this.Repos.Users.getUser(userId);
    const cart = user.Cart;
    const price = this.Controllers.Stores.getCartPrice(
      userId,
      this.getCart(userId)
    );
    this.Controllers.PurchasesHistory.purchaseCart(
      userId,
      cart,
      price,
      creditCard
    );
    const notificationMsg = `The cart ${cart.toString()} has been purchased for ${price}.`;
    const notification = new Notification("purchase", notificationMsg);
    user.addNotification(notification);
    user.clearCart(); /// notice we clear the cart in the end of the purchase.
  }
  addUser(userId: string): void {
    this.Repos.Users.addUser(userId);
  }
  removeUser(userId: string): void {
    this.Repos.Users.removeUser(userId);
  }
  readNotification(userId: string, notificationId: string): void {
    const user = this.Repos.Users.getUser(userId);
    user.readNotification(notificationId);
  }
  getUnreadNotifications(userId: string): Notification[] {
    const user = this.Repos.Users.getUser(userId);
    return user.Notifications.filter((notification) => !notification.IsRead);
  }
  addNotification(
    userId: string,
    notificationType: string,
    notificationMsg: string
  ): string {
    const user = this.Repos.Users.getUser(userId);
    const notification = new Notification(notificationType, notificationMsg);
    user.addNotification(notification);
    return notification.Id;
  }
  startSession(): string {
    const guestId = this.Controllers.Auth.startSession();
    this.addUser(guestId);
    return guestId;
  }
  register(email: string, @censored password: string): string {
    const MemberId = this.Controllers.Auth.register(email, password);
    this.Repos.Users.addUser(MemberId);
    return MemberId;
  }
  login(guestId: string, email: string, @censored password: string): string {
    this.Repos.Users.getUser(guestId);
    const MemberId = this.Controllers.Auth.login(guestId, email, password);
    this.Repos.Users.getUser(MemberId);
    return MemberId;
  }
  logout(userId: string): string {
    const guestId = this.Controllers.Auth.logout(userId);
    this.Repos.Users.addUser(guestId);
    return guestId;
  }
  disconnect(userId: string): void {
    if (this.Controllers.Auth.isGuest(userId)) {
      this.Repos.Users.removeUser(userId);
    }
    this.Controllers.Auth.disconnect(userId);
  }
  isUserExist(userId: string): boolean {
    return this.Repos.Users.isUserExist(userId);
  }
}
