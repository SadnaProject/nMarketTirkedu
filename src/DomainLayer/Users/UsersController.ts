import { HasControllers } from "../HasController";
import { Mixin } from "ts-mixer";
import { type CartDTO } from "./Cart";
import { Notification } from "./Notification";
import { HasRepos, createRepos } from "./HasRepos";
import { Testable, testable } from "~/Testable";
export interface IUsersController {
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
  purchaseCart(userId: string, creditCard): void;
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
    const storeId = this.Controllers.Stores.getStoreIdByProductId(productId);
    if (
      !this.Controllers.Stores.isProductQuantityInStock(productId, quantity)
    ) {
      throw new Error("store don't have such amount of product");
    }
    user.addProductToCart(productId, quantity, storeId);
  }
  removeProductFromCart(userId: string, productId: string): void {
    const user = this.Repos.Users.getUser(userId);
    const storeId = this.Controllers.Stores.getStoreIdByProductId(productId);
    user.removeProductFromCart(productId, storeId);
  }
  editProductQuantityInCart(
    userId: string,
    productId: string,
    quantity: number
  ): void {
    const user = this.Repos.Users.getUser(userId);
    if (
      !this.Controllers.Stores.isProductQuantityInStock(productId, quantity)
    ) {
      throw new Error("store don't have such amount of product");
    }
    const storeId = this.Controllers.Stores.getStoreIdByProductId(productId);
    user.editProductQuantityInCart(productId, storeId, quantity);
  }
  getCart(userId: string): CartDTO {
    return this.Repos.Users.getUser(userId).Cart;
  }
  purchaseCart(userId: string, creditCard: string): void {
    const user = this.Repos.Users.getUser(userId);
    const cart = user.Cart;
    const price = this.getTotalPrice(userId);
    this.Controllers.PurchasesHistory.purchaseCart(userId, cart, price, creditCard);
    const notificationMsg = `The cart ${cart.toString()} has been purchased for ${price}.`;
    const notification = new Notification("purchase", notificationMsg);
    user.addNotification(notification);
    user.clearCart();
  }
  addUser(userId: string, userName: string): void {
    this.Repos.Users.addUser(userId, userName);
  }
  removeUser(userId: string): void {
    this.Repos.Users.removeUser(userId);
  }
  getTotalPrice(userId: string): number {
    return this.Controllers.Stores.getCartPrice(
      this.Repos.Users.getUser(userId).Cart
    );
  }
  getBasketTotalPrice(userId: string, storeId: string): number {
    const x =
      this.Repos.Users.getUser(userId).Cart.storeIdToBasket.get(storeId);
    if (x == undefined) {
      throw new Error("The user does not have a basket in this store.");
    }
    return this.Controllers.Stores.getBasketPrice(x);
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
}
