import { HasControllers } from "../HasController";
import { type BasketDTO } from "./Basket";
import { type CartDTO } from "./Cart";
import { type UserDTO } from "./User";
import { UserRepo } from "./UserRepo";
import { Notification } from "./Notification";
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
addProductToCart(userId: string, productId: string, quantity: number,storeId:string): void;
/**
 * This function removes a product from a user's cart.
 * @param userId The id of the user that is currently logged in.
 * @param productId The id of the product that is being removed from the cart.
 * @throws Error if the product is not in the cart.
 */
removeProductFromCart(userId: string, productId: string, storeId:string): void;
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
  storeId:string,
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
purchaseCart(userId: string): void;
/**
 * This function adds a user to the system.
 * @param user The user that is being added to the system.
 */
addUser(userId:string,userName:string): void;
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
}

export class UsersController
  extends HasControllers
  implements IUsersController
{

  private userRepo: UserRepo = new UserRepo();
  getNotifications(userId: string): Notification[] {
    return this.userRepo.getUser(userId).Notifications;
  }
  addProductToCart(userId: string, productId: string, quantity: number,storeId:string): void {
    const user = this.userRepo.getUser(userId); // notice that we get the user from the repo and not from the system
    user.addProductToCart(productId, quantity,storeId);
  }
  removeProductFromCart(userId: string, productId: string,storeId:string): void {
    const user = this.userRepo.getUser(userId);
    user.removeProductFromCart(productId,storeId);
  }
  editProductQuantityInCart(
    userId: string,
    productId: string,
    storeId:string,
    quantity: number
  ): void {
    const user = this.userRepo.getUser(userId);
    user.editProductQuantityInCart(productId,storeId, quantity);
  }
  getCart(userId: string): CartDTO {
    return this.userRepo.getUser(userId).Cart;  
  }
  purchaseCart(userId: string): void {
    const user = this.userRepo.getUser(userId);
    const cart = user.Cart;
    const price = 0; //TODO omer- this.Controllers.Stores.getTotalPrice(Cart);
    this.Controllers.PurchasesHistory.purchaseCart(userId,cart); // TODO Bpincu add price to the arguments, and add way to enter the payment details, throw the specific error if the payment failed
    const notificationMsg =`The cart ${cart.toString()} has been purchased for ${price}.`;
    const notification = new Notification( "purchase",notificationMsg );
    user.addNotification(notification);
  }
  addUser(userId:string, userName:string): void {
    this.userRepo.addUser(userId, userName);
  }
  removeUser(userId: string): void {
    this.userRepo.removeUser(userId);
  }
  getTotalPrice(Cart: CartDTO): number {
   //return this.Controllers.Stores.getTotalPrice(Cart); 
    throw new Error("Method not implemented.");
  }
  getBasketTotalPrice(Basket: BasketDTO): number {
   //return this.Controllers.Stores.getTotalPrice(Basket); 
   throw new Error("Method not implemented.");
  }
  readNotification(userId: string, notificationId: string): void {
    const user = this.userRepo.getUser(userId);
    user.readNotification(notificationId);
  }
}