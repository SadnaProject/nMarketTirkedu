import { AuthController } from "./Auth/AuthController";
import { JobsController } from "./Jobs/JobsController";
import { PurchasesHistoryController } from "./PurchasesHistory/PurchasesHistoryController";
import { StoresController } from "./Stores/StoresController";
import { UsersController } from "./Users/UsersController";

const controllersMapping = {
  Stores: StoresController,
  Auth: AuthController,
  PurchasesHistory: PurchasesHistoryController,
  Users: UsersController,
  Jobs: JobsController,
};

// NO TOUCHY BELOW THIS LINE 😉

type Controllers = {
  [key in keyof typeof controllersMapping]: InstanceType<
    (typeof controllersMapping)[key]
  >;
};

export function createControllers() {
  const controllers: Record<string, unknown> = {};
  for (const [key, Controller] of Object.entries(controllersMapping)) {
    controllers[key] = new Controller().initControllers(
      controllers as Controllers
    );
  }
  return controllers as Controllers;
}

export function createTestControllers(testedController: keyof Controllers) {
  const controllers: Record<string, unknown> = {};
  for (const [key, Controller] of Object.entries(controllersMapping)) {
    let controller = new Controller().initControllers(
      controllers as Controllers
    );
    if (key !== testedController) {
      controller = controller.test();
    }
    controllers[key] = controller;
  }
  return controllers as Controllers;
}
