import { StoresController } from "./Stores/StoresController";
import { AuthController } from "./Auth/AuthController";
import { type Controllers } from "./HasController";
import { JobsController } from "./Jobs/JobsController";
import { PurchasesHistoryController } from "./PurchasesHistory/PurchasesHistoryController";
import { UsersController } from "./Users/UsersController";

export class MarketFacade {
  private controllers: Controllers;

  constructor() {
    const storesController = new StoresController();
    const authController = new AuthController();
    const jobsController = new JobsController();
    const purchasesHistoryController = new PurchasesHistoryController();
    const usersController = new UsersController();

    this.controllers = {
      Stores: storesController,
      Auth: authController,
      Jobs: jobsController,
      PurchasesHistory: purchasesHistoryController,
      Users: usersController,
    };

    storesController.initControllers(this.controllers);
    authController.initControllers(this.controllers);
    jobsController.initControllers(this.controllers);
    purchasesHistoryController.initControllers(this.controllers);
    usersController.initControllers(this.controllers);
  }
  private isConnectionValid(userId: string): void {
    if (!this.controllers.Auth.isConnected(userId))
      throw new Error("User is not logged in");
  }
  //Checking if user is logged in is done here.
  public addProductToCart(userId: string,productId: string, quantity: number) {
    this.isConnectionValid(userId);
    if(!this.controllers.Stores.isProductQuantityInStock(productId, quantity)){
      throw new Error("Product is out of stock");
    }    
    const storeId = ""; 
    // this.controllers.Stores.getStoreIdByProductId(productId); //TODO: Omer - check if this is the right way to get the storeId
    this.controllers.Users.addProductToCart(userId, productId, quantity,storeId);
  }
  public removeProductFromCart(userId: string,productId: string) {
    this.isConnectionValid(userId);
    const storeId = ""; 
    // this.controllers.Stores.getStoreIdByProductId(productId); //TODO: Omer - check if this is the right way to get the storeId
    this.controllers.Users.removeProductFromCart(userId, productId,storeId);
  }
  public editProductQuantityInCart( userId: string,productId: string, quantity: number) {
    this.isConnectionValid(userId);
    const storeId = "";
     //this.controllers.Stores.getStoreIdByProductId(productId); //TODO: Omer - check if this is the right way to get the storeId
    if(!this.controllers.Stores.isProductQuantityInStock(productId, quantity)){
      throw new Error("Product is out of stock");
    } 
    this.controllers.Users.editProductQuantityInCart(userId, productId, storeId, quantity);
  }
  public getCart(userId: string) {
    this.isConnectionValid(userId);
    return this.controllers.Users.getCart(userId);
  }
  public getNotifications(userId: string) {
    this.isConnectionValid(userId);
    return this.controllers.Users.getNotifications(userId);
  }
  public purchaseCart(userId: string) {
    this.isConnectionValid(userId);
    this.controllers.Users.purchaseCart(userId);
  }
  public addUser(userId:string ,userName:string) {
    this.controllers.Users.addUser(userId, userName);
  }
  public removeUser(userId: string) {
    this.controllers.Users.removeUser(userId);
  }
  public readNotification(userId: string, notificationId: string) {
    this.isConnectionValid(userId);
    this.controllers.Users.readNotification(userId, notificationId);
  }
}
