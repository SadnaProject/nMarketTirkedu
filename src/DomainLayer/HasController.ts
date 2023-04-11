import { type IAuthController } from "./Auth/AuthController";
import { type IJobsController } from "./Jobs/JobsController";
import { type IPurchasesHistoryController } from "./PurchasesHistory/PurchasesHistoryController";
import { type IStoresController } from "./Stores/StoresController";
import { type IUsersController } from "./Users/UsersController";

//! After changing this type, you must change the type in initControllers file
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
    return this;
  }

  public get Controllers() {
    if (!this.controllers) {
      throw new Error("Controllers not initialized");
    }
    return this.controllers;
  }
}
