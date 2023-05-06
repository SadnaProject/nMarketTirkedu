/* eslint-disable @typescript-eslint/no-empty-function */
import { beforeEach, describe, expect, vi } from "vitest";
import { type Repos, createMockRepos, createTestRepos } from "./_HasRepos";

import { itUnitIntegration } from "../_mock";
import {
  createMockControllers,
  createTestControllers,
} from "../_createControllers";
import { type Controllers } from "../_HasController";
import { get } from "http";
import { GuestUserAuth } from "../Auth/GuestUserAuth";
import { MemberUserAuth } from "../Auth/MemberUserAuth";
import { test } from "node:test";

export function createMember(name: string, password: string) {
  return MemberUserAuth.create(name, password);
}
function getMemberI(i: number): MemberUserAuth {
  return MemberUserAuth.create(
    "user" + i.toString() + "@email.com",
    "password" + i.toString()
  );
}

function getGuestI(i: number): GuestUserAuth {
  return GuestUserAuth.create();
}
let repos: Repos;
let controllers: Controllers;
function generateEmailI(i: number): string {
  return "user" + i.toString() + "@email.com";
}
function generatePasswordI(i: number): string {
  return "password" + i.toString();
}
beforeEach(() => {
  const testType = "integration";
  controllers = createTestControllers(testType, "Jobs");
  repos = createTestRepos(testType);
  controllers.Jobs.initRepos(repos);
});
describe("InitializeStore", () => {
  itUnitIntegration("✅InitializeStore", (testType) => {
    const storeId = "store1";
    const founderId = "founder1";

    expect(() => controllers.Jobs.getStoreFounderId(storeId)).toThrow();

    expect(() =>
      controllers.Jobs.InitializeStore(founderId, storeId)
    ).not.toThrow();
    expect(controllers.Jobs.getStoreFounderId(storeId)).toEqual(founderId);
  });
});
describe("Make position holder", () => {
  itUnitIntegration("✅Make store owner", (testType) => {
    const storeId = "store1";
    const founderId = "founder1";
    const owner1Id = "owner1";
    const owner2Id = "owner2";
    controllers.Jobs.InitializeStore(founderId, storeId);
    expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(false);
    controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
    expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(true);
    expect(controllers.Jobs.isStoreOwner(owner2Id, storeId)).toEqual(false);
    controllers.Jobs.makeStoreOwner(owner1Id, storeId, owner2Id);
    expect(controllers.Jobs.isStoreOwner(owner2Id, storeId)).toEqual(true);
  });
  //a test for the bad case of trying to make a store owner without being a store owner
  itUnitIntegration(
    "❌Make store owner fails because the user appointing is not a store owner/founder",
    (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const owner1Id = "owner1";
      const owner2Id = "owner2";
      controllers.Jobs.InitializeStore(founderId, storeId);
      expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(false);
      expect(() =>
        controllers.Jobs.makeStoreOwner(owner2Id, storeId, owner1Id)
      ).toThrow();
      expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(false);
    }
  );
  //make store manager
  itUnitIntegration("✅Make store manager", (testType) => {
    const storeId = "store1";
    const founderId = "founder1";
    const owner1Id = "owner1";
    const manager1Id = "manager1";
    const manager2Id = "manager2";
    const manager3Id = "manager3";
    controllers.Jobs.InitializeStore(founderId, storeId);
    expect(controllers.Jobs.isStoreManager(manager1Id, storeId)).toEqual(false);
    controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
    controllers.Jobs.makeStoreManager(owner1Id, storeId, manager1Id);
    expect(controllers.Jobs.isStoreManager(manager1Id, storeId)).toEqual(true);
    expect(controllers.Jobs.isStoreManager(manager2Id, storeId)).toEqual(false);
    controllers.Jobs.makeStoreManager(founderId, storeId, manager2Id);
    expect(controllers.Jobs.isStoreManager(manager2Id, storeId)).toEqual(true);
  });
  //a test for the bad case of trying to make a store manager without being a store owner/founder
  itUnitIntegration(
    "❌Make store manager fails because the user appointing is not a store owner/founder",
    (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const manager1Id = "manager1";
      const manager2Id = "manager2";
      const manager3Id = "manager3";
      controllers.Jobs.InitializeStore(founderId, storeId);
      expect(controllers.Jobs.isStoreManager(manager1Id, storeId)).toEqual(
        false
      );
      expect(() =>
        controllers.Jobs.makeStoreManager(manager2Id, storeId, manager1Id)
      ).toThrow();
      expect(controllers.Jobs.isStoreManager(manager1Id, storeId)).toEqual(
        false
      );
      controllers.Jobs.makeStoreManager(founderId, storeId, manager1Id);
      expect(controllers.Jobs.isStoreManager(manager1Id, storeId)).toEqual(
        true
      );
      expect(() =>
        controllers.Jobs.makeStoreManager(manager1Id, storeId, manager2Id)
      ).toThrow();
    }
  );
});
describe("Remove position holder", () => {
  itUnitIntegration("✅Remove store owner", (testType) => {
    const storeId = "store1";
    const founderId = "founder1";
    const owner1Id = "owner1";
    const owner2Id = "owner2";
    controllers.Jobs.InitializeStore(founderId, storeId);
    expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(false);
    controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
    expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(true);
    expect(controllers.Jobs.isStoreOwner(owner2Id, storeId)).toEqual(false);
    controllers.Jobs.makeStoreOwner(owner1Id, storeId, owner2Id);
    expect(controllers.Jobs.isStoreOwner(owner2Id, storeId)).toEqual(true);
    controllers.Jobs.removeStoreOwner(owner1Id, storeId, owner2Id);
    expect(controllers.Jobs.isStoreOwner(owner2Id, storeId)).toEqual(false);
    expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(true);
    controllers.Jobs.removeStoreOwner(founderId, storeId, owner1Id);
    expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(false);
  });
  //a test for the bad case of trying to remove a store owner without being a store owner/founder
  itUnitIntegration(
    "❌Remove store owner fails because the user removing is not the appointer of the owner to be removed",
    (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const owner1Id = "owner1";
      const owner2Id = "owner2";
      controllers.Jobs.InitializeStore(founderId, storeId);
      expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(false);
      controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
      expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(true);
      expect(controllers.Jobs.isStoreOwner(owner2Id, storeId)).toEqual(false);
      controllers.Jobs.makeStoreOwner(owner1Id, storeId, owner2Id);
      expect(controllers.Jobs.isStoreOwner(owner2Id, storeId)).toEqual(true);
      expect(() =>
        controllers.Jobs.removeStoreOwner(owner2Id, storeId, owner1Id)
      ).toThrow();
      expect(() =>
        controllers.Jobs.removeStoreOwner(founderId, storeId, owner2Id)
      ).toThrow();
      expect(controllers.Jobs.isStoreOwner(owner2Id, storeId)).toEqual(true);
      expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(true);
    }
  );
  itUnitIntegration(
    "❌Remove store owner fails because the user to be removed is not a store owner",
    (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const owner1Id = "owner1";
      const owner2Id = "owner2";
      controllers.Jobs.InitializeStore(founderId, storeId);
      expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(false);
      controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
      expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(true);
      expect(controllers.Jobs.isStoreOwner(owner2Id, storeId)).toEqual(false);
      expect(() =>
        controllers.Jobs.removeStoreOwner(founderId, storeId, owner2Id)
      ).toThrow();
      expect(controllers.Jobs.isStoreOwner(owner2Id, storeId)).toEqual(false);
      expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(true);
    }
  );
  itUnitIntegration("✅Remove store manager", (testType) => {
    const storeId = "store1";
    const founderId = "founder1";
    const manager1Id = "manager1";
    controllers.Jobs.InitializeStore(founderId, storeId);
    expect(controllers.Jobs.isStoreManager(manager1Id, storeId)).toEqual(false);
    controllers.Jobs.makeStoreManager(founderId, storeId, manager1Id);
    expect(controllers.Jobs.isStoreManager(manager1Id, storeId)).toEqual(true);
    controllers.Jobs.removeStoreManager(founderId, storeId, manager1Id);
    expect(controllers.Jobs.isStoreManager(manager1Id, storeId)).toEqual(false);
  });
  //a test for the bad case of trying to remove a store manager without being a store owner/founder
  itUnitIntegration(
    "❌Remove store manager fails because the user removing is not the appointer of the manager to be removed",
    (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const owner1Id = "owner1";
      const manager1Id = "manager1";

      controllers.Jobs.InitializeStore(founderId, storeId);
      expect(controllers.Jobs.isStoreManager(manager1Id, storeId)).toEqual(
        false
      );
      controllers.Jobs.makeStoreManager(founderId, storeId, manager1Id);
      expect(controllers.Jobs.isStoreManager(manager1Id, storeId)).toEqual(
        true
      );
      controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
      expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(true);
      expect(() =>
        controllers.Jobs.removeStoreManager(owner1Id, storeId, manager1Id)
      ).toThrow();
    }
  );
});
describe("permissions", () => {
  itUnitIntegration(
    "✅System admin has the correct permissions",
    (testType) => {
      //
      const AdminId = controllers.Auth.register("admin", "admin");
      controllers.Jobs.setInitialAdmin(AdminId);
      expect(controllers.Jobs.isSystemAdmin(AdminId)).toEqual(true);
      expect(
        controllers.Jobs.canCloseStorePermanently(AdminId, "store1")
      ).toEqual(true);
      expect(
        controllers.Jobs.canReceivePurchaseHistoryFromStore(AdminId, "store1")
      ).toEqual(true);
    }
  );

  itUnitIntegration(
    "✅Store founder has the correct permissions",
    (testType) => {
      //
      const storeId = "store1";

      const founderId = "founder1";
      controllers.Jobs.InitializeStore(founderId, storeId);
      expect(controllers.Jobs.isStoreFounder(founderId, storeId)).toEqual(true);
      expect(controllers.Jobs.canActivateStore(founderId, storeId)).toEqual(
        true
      );
      expect(
        controllers.Jobs.canCloseStorePermanently(founderId, storeId)
      ).toEqual(false);
      expect(
        controllers.Jobs.canCreateProductInStore(founderId, storeId)
      ).toEqual(true);
      expect(
        controllers.Jobs.canRemoveProductFromStore(founderId, storeId)
      ).toEqual(true);
      expect(
        controllers.Jobs.canEditProductInStore(founderId, storeId)
      ).toEqual(true);
      expect(controllers.Jobs.canDeactivateStore(founderId, storeId)).toEqual(
        true
      );
      expect(
        controllers.Jobs.canReceivePurchaseHistoryFromStore(founderId, storeId)
      ).toEqual(true);
      expect(controllers.Jobs.canRemoveMember(founderId)).toEqual(false);
    }
  );
  itUnitIntegration("✅Store Owner has the correct permissions", (testType) => {
    //
    const storeId = "store1";
    const founderId = "founder1";
    const owner1Id = "owner1";
    controllers.Jobs.InitializeStore(founderId, storeId);
    controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
    expect(controllers.Jobs.isStoreOwner(owner1Id, storeId)).toEqual(true);
    expect(controllers.Jobs.canActivateStore(owner1Id, storeId)).toEqual(false);
    expect(
      controllers.Jobs.canCloseStorePermanently(owner1Id, storeId)
    ).toEqual(false);
    expect(controllers.Jobs.canCreateProductInStore(owner1Id, storeId)).toEqual(
      true
    );
    expect(
      controllers.Jobs.canRemoveProductFromStore(owner1Id, storeId)
    ).toEqual(true);
    expect(controllers.Jobs.canEditProductInStore(owner1Id, storeId)).toEqual(
      true
    );
    expect(controllers.Jobs.canDeactivateStore(owner1Id, storeId)).toEqual(
      false
    );
    expect(
      controllers.Jobs.canReceivePurchaseHistoryFromStore(owner1Id, storeId)
    ).toEqual(true);
    expect(controllers.Jobs.canRemoveMember(owner1Id)).toEqual(false);
  });
  itUnitIntegration(
    "✅Store Manger has the correct default permissions",
    (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const manager1Id = "manager1";
      controllers.Jobs.InitializeStore(founderId, storeId);
      controllers.Jobs.makeStoreManager(founderId, storeId, manager1Id);
      expect(controllers.Jobs.isStoreManager(manager1Id, storeId)).toEqual(
        true
      );
      expect(controllers.Jobs.canActivateStore(manager1Id, storeId)).toEqual(
        false
      );
      expect(
        controllers.Jobs.canCloseStorePermanently(manager1Id, storeId)
      ).toEqual(false);
      expect(
        controllers.Jobs.canCreateProductInStore(manager1Id, storeId)
      ).toEqual(false);
      expect(
        controllers.Jobs.canRemoveProductFromStore(manager1Id, storeId)
      ).toEqual(false);
      expect(
        controllers.Jobs.canEditProductInStore(manager1Id, storeId)
      ).toEqual(false);
      expect(controllers.Jobs.canDeactivateStore(manager1Id, storeId)).toEqual(
        false
      );
      expect(
        controllers.Jobs.canReceivePurchaseHistoryFromStore(manager1Id, storeId)
      ).toEqual(true);
      expect(controllers.Jobs.canRemoveMember(manager1Id)).toEqual(false);
    }
  );
  itUnitIntegration(
    "✅Store Manger has the correct permissions after being granted permissions",
    (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const manager1Id = "manager1";
      controllers.Jobs.InitializeStore(founderId, storeId);
      controllers.Jobs.makeStoreManager(founderId, storeId, manager1Id);
      expect(controllers.Jobs.isStoreManager(manager1Id, storeId)).toEqual(
        true
      );
      expect(controllers.Jobs.canActivateStore(manager1Id, storeId)).toEqual(
        false
      );
      expect(
        controllers.Jobs.canCreateProductInStore(manager1Id, storeId)
      ).toEqual(false);
      controllers.Jobs.setAddingProductToStorePermission(
        founderId,
        storeId,
        manager1Id,
        true
      );
      expect(
        controllers.Jobs.canCreateProductInStore(manager1Id, storeId)
      ).toEqual(true);
      controllers.Jobs.setAddingProductToStorePermission(
        founderId,
        storeId,
        manager1Id,
        false
      );
      expect(
        controllers.Jobs.canCreateProductInStore(manager1Id, storeId)
      ).toEqual(false);
      expect(
        controllers.Jobs.canRemoveProductFromStore(manager1Id, storeId)
      ).toEqual(false);
      controllers.Jobs.setRemovingProductFromStorePermission(
        founderId,
        storeId,
        manager1Id,
        true
      );
      expect(
        controllers.Jobs.canRemoveProductFromStore(manager1Id, storeId)
      ).toEqual(true);
      controllers.Jobs.setRemovingProductFromStorePermission(
        founderId,
        storeId,
        manager1Id,
        false
      );
      expect(
        controllers.Jobs.canRemoveProductFromStore(manager1Id, storeId)
      ).toEqual(false);
      expect(
        controllers.Jobs.canEditProductInStore(manager1Id, storeId)
      ).toEqual(false);
      controllers.Jobs.setEditingProductInStorePermission(
        founderId,
        storeId,
        manager1Id,
        true
      );
      expect(
        controllers.Jobs.canEditProductInStore(manager1Id, storeId)
      ).toEqual(true);
      controllers.Jobs.setEditingProductInStorePermission(
        founderId,
        storeId,
        manager1Id,
        false
      );
      expect(
        controllers.Jobs.canEditProductInStore(manager1Id, storeId)
      ).toEqual(false);
    }
  );
  //fail
  itUnitIntegration(
    "❌Permissions are not granted because grantor is not the appointer",
    (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const owner1Id = "owner1";
      const manager1Id = "manager1";
      controllers.Jobs.InitializeStore(founderId, storeId);
      controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
      controllers.Jobs.makeStoreManager(founderId, storeId, manager1Id);
      expect(() =>
        controllers.Jobs.setAddingProductToStorePermission(
          owner1Id,
          storeId,
          manager1Id,
          true
        )
      ).toThrow();
      expect(() =>
        controllers.Jobs.setRemovingProductFromStorePermission(
          owner1Id,
          storeId,
          manager1Id,
          true
        )
      ).toThrow();
      expect(() =>
        controllers.Jobs.setEditingProductInStorePermission(
          owner1Id,
          storeId,
          manager1Id,
          true
        )
      ).toThrow();
    }
  );
});
