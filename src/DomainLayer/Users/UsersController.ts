import { Controller } from "../Controller";
import { type CartDTO } from "./Cart";

export interface IUsersController {
  /**
   * This function gets the notifications of a user.
   * @param userId The id of the user that is currently logged in.
   * @returns The notifications of the user.
   */
  getNotifications(userId: string): never;
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

  purchaseCart(userId: string): void;
}

export class UsersController extends Controller implements IUsersController {
  getNotifications(userId: string): never {
    throw new Error("Method not implemented.");
  }
  addProductToCart(userId: string, productId: string, quantity: number): void {
    throw new Error("Method not implemented.");
  }
  removeProductFromCart(userId: string, productId: string): void {
    throw new Error("Method not implemented.");
  }
  editProductQuantityInCart(
    userId: string,
    productId: string,
    quantity: number
  ): void {
    throw new Error("Method not implemented.");
  }
  getCart(userId: string): never {
    throw new Error("Method not implemented.");
  }
  purchaseCart(userId: string): void {
    throw new Error("Method not implemented.");
  }
}
