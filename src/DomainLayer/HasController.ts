import { AuthController, type IAuthController } from "./Auth/AuthController";
import { JobsController, type IJobsController } from "./Jobs/JobsController";
import { PurchasesHistoryController, type IPurchasesHistoryController } from "./PurchasesHistory/PurchasesHistoryController";
import { StoresController, type IStoresController } from "./Stores/StoresController";
import { UsersController, type IUsersController } from "./Users/UsersController";

export type Controllers = {
  PurchasesHistory: IPurchasesHistoryController;
  Stores: IStoresController;
  Users: IUsersController;
  Jobs: IJobsController;
  Auth: IAuthController;
};
export class HasControllers {
  private controllers?: Controllers;

  public initControllers(controllers: Controllers) {
    this.controllers = controllers;
  }

  public get Controllers() {
    if (!this.controllers) {
      throw new Error("Controllers not initialized");
    }
    return this.controllers;
  }
}
