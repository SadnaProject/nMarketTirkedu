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
  public addProductToCart(userId: string, productId: number, quantity: number) {
    this.isConnectionValid(userId);
    //...
  }
}
