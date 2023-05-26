import { beforeEach, describe, expect } from "vitest";
import { type Repos, createTestRepos } from "./_HasRepos";
import { itUnitIntegration } from "../_mock";
import { GuestUserAuth } from "../Auth/GuestUserAuth";
import { MemberUserAuth } from "../Auth/MemberUserAuth";
import { JobsController } from "./JobsController";
import { AuthController } from "../Auth/AuthController";
import { getDB } from "server/domain/_Transactional";
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
// let controllers: Controllers;
let controllers: { Jobs: JobsController; Auth: AuthController };
function generateEmailI(i: number): string {
  return "user" + i.toString() + "@email.com";
}
function generatePasswordI(i: number): string {
  return "password" + i.toString();
}
beforeEach(async () => {
  await getDB().positionHolder.deleteMany({});
  await getDB().role.deleteMany({});
  await getDB().admin.deleteMany({});
  await getDB().userAuth.deleteMany({});
  const testType = "integration";
  // controllers = createTestControllers(testType, "Jobs");
  controllers = { Jobs: new JobsController(), Auth: new AuthController() };
  repos = createTestRepos(testType);
  controllers.Jobs.initRepos(repos);
});
describe("InitializeStore", () => {
  itUnitIntegration("✅InitializeStore", async (testType) => {
    const storeId = "store1";
    const founderId = "founder1";

    await expect(controllers.Jobs.getStoreFounderId(storeId)).rejects.toThrow();

    await expect(
      controllers.Jobs.InitializeStore(founderId, storeId)
    ).resolves.not.toThrow();
    await expect(controllers.Jobs.getStoreFounderId(storeId)).resolves.toEqual(
      founderId
    );
  });
});
describe("Make position holder", () => {
  itUnitIntegration("✅Make store owner", async (testType) => {
    const storeId = "store1";
    const founderId = "founder1";
    const owner1Id = "owner1";
    const owner2Id = "owner2";
    await controllers.Jobs.InitializeStore(founderId, storeId);
    await expect(
      controllers.Jobs.isStoreOwner(owner1Id, storeId)
    ).resolves.toEqual(false);
    await controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
    await expect(
      controllers.Jobs.isStoreOwner(owner1Id, storeId)
    ).resolves.toEqual(true);
    await expect(
      controllers.Jobs.isStoreOwner(owner2Id, storeId)
    ).resolves.toEqual(false);
    await controllers.Jobs.makeStoreOwner(owner1Id, storeId, owner2Id);
    await expect(
      controllers.Jobs.isStoreOwner(owner2Id, storeId)
    ).resolves.toEqual(true);
  });
  // a test for the bad case of trying to make a store owner without being a store owner
  itUnitIntegration(
    "❌Make store owner fails because the user appointing is not a store owner/founder",
    async (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const owner1Id = "owner1";
      const owner2Id = "owner2";
      await controllers.Jobs.InitializeStore(founderId, storeId);
      await expect(
        controllers.Jobs.isStoreOwner(owner1Id, storeId)
      ).resolves.toEqual(false);
      await expect(() =>
        controllers.Jobs.makeStoreOwner(owner2Id, storeId, owner1Id)
      ).rejects.toThrow();
      await expect(
        controllers.Jobs.isStoreOwner(owner1Id, storeId)
      ).resolves.toEqual(false);
    }
  );
  //make store manager
  itUnitIntegration("✅Make store manager", async (testType) => {
    const storeId = "store1";
    const founderId = "founder1";
    const owner1Id = "owner1";
    const manager1Id = "manager1";
    const manager2Id = "manager2";
    const manager3Id = "manager3";
    await controllers.Jobs.InitializeStore(founderId, storeId);
    await expect(
      controllers.Jobs.isStoreManager(manager1Id, storeId)
    ).resolves.toEqual(false);
    await controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
    await controllers.Jobs.makeStoreManager(owner1Id, storeId, manager1Id);
    await expect(
      controllers.Jobs.isStoreManager(manager1Id, storeId)
    ).resolves.toEqual(true);
    await expect(
      controllers.Jobs.isStoreManager(manager2Id, storeId)
    ).resolves.toEqual(false);
    await controllers.Jobs.makeStoreManager(founderId, storeId, manager2Id);
    await expect(
      controllers.Jobs.isStoreManager(manager2Id, storeId)
    ).resolves.toEqual(true);
  });
  //a test for the bad case of trying to make a store manager without being a store owner/founder
  itUnitIntegration(
    "❌Make store manager fails because the user appointing is not a store owner/founder",
    async (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const manager1Id = "manager1";
      const manager2Id = "manager2";
      const manager3Id = "manager3";
      await controllers.Jobs.InitializeStore(founderId, storeId);
      await expect(
        controllers.Jobs.isStoreManager(manager1Id, storeId)
      ).resolves.toEqual(false);
      await expect(
        controllers.Jobs.makeStoreManager(manager2Id, storeId, manager1Id)
      ).rejects.toThrow();
      await expect(
        controllers.Jobs.isStoreManager(manager1Id, storeId)
      ).resolves.toEqual(false);
      await controllers.Jobs.makeStoreManager(founderId, storeId, manager1Id);
      await expect(
        controllers.Jobs.isStoreManager(manager1Id, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.makeStoreManager(manager1Id, storeId, manager2Id)
      ).rejects.toThrow();
    }
  );
});
describe("Remove position holder", () => {
  itUnitIntegration("✅Remove store owner", async (testType) => {
    const storeId = "store1";
    const founderId = "founder1";
    const owner1Id = "owner1";
    const owner2Id = "owner2";
    await controllers.Jobs.InitializeStore(founderId, storeId);
    await expect(
      controllers.Jobs.isStoreOwner(owner1Id, storeId)
    ).resolves.toEqual(false);
    await controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
    await expect(
      controllers.Jobs.isStoreOwner(owner1Id, storeId)
    ).resolves.toEqual(true);
    await expect(
      controllers.Jobs.isStoreOwner(owner2Id, storeId)
    ).resolves.toEqual(false);
    await controllers.Jobs.makeStoreOwner(owner1Id, storeId, owner2Id);
    await expect(
      controllers.Jobs.isStoreOwner(owner2Id, storeId)
    ).resolves.toEqual(true);
    await controllers.Jobs.removeStoreOwner(owner1Id, storeId, owner2Id);
    await expect(
      controllers.Jobs.isStoreOwner(owner2Id, storeId)
    ).resolves.toEqual(false);
    await expect(
      controllers.Jobs.isStoreOwner(owner1Id, storeId)
    ).resolves.toEqual(true);
    await controllers.Jobs.removeStoreOwner(founderId, storeId, owner1Id);
    await expect(
      controllers.Jobs.isStoreOwner(owner1Id, storeId)
    ).resolves.toEqual(false);
  });
  //a test for the bad case of trying to remove a store owner without being a store owner/founder
  itUnitIntegration(
    "❌Remove store owner fails because the user removing is not the appointer of the owner to be removed",
    async (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const owner1Id = "owner1";
      const owner2Id = "owner2";
      await controllers.Jobs.InitializeStore(founderId, storeId);
      await expect(
        controllers.Jobs.isStoreOwner(owner1Id, storeId)
      ).resolves.toEqual(false);
      await controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
      await expect(
        controllers.Jobs.isStoreOwner(owner1Id, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.isStoreOwner(owner2Id, storeId)
      ).resolves.toEqual(false);
      await controllers.Jobs.makeStoreOwner(owner1Id, storeId, owner2Id);
      await expect(
        controllers.Jobs.isStoreOwner(owner2Id, storeId)
      ).resolves.toEqual(true);
      await expect(() =>
        controllers.Jobs.removeStoreOwner(owner2Id, storeId, owner1Id)
      ).rejects.toThrow();
      await expect(() =>
        controllers.Jobs.removeStoreOwner(founderId, storeId, owner2Id)
      ).rejects.toThrow();
      await expect(
        controllers.Jobs.isStoreOwner(owner2Id, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.isStoreOwner(owner1Id, storeId)
      ).resolves.toEqual(true);
    }
  );
  itUnitIntegration(
    "❌Remove store owner fails because the user to be removed is not a store owner",
    async (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const owner1Id = "owner1";
      const owner2Id = "owner2";
      await controllers.Jobs.InitializeStore(founderId, storeId);
      await expect(
        controllers.Jobs.isStoreOwner(owner1Id, storeId)
      ).resolves.toEqual(false);
      await controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
      await expect(
        controllers.Jobs.isStoreOwner(owner1Id, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.isStoreOwner(owner2Id, storeId)
      ).resolves.toEqual(false);
      await expect(() =>
        controllers.Jobs.removeStoreOwner(founderId, storeId, owner2Id)
      ).rejects.toThrow();
      await expect(
        controllers.Jobs.isStoreOwner(owner2Id, storeId)
      ).resolves.toEqual(false);
      await expect(
        controllers.Jobs.isStoreOwner(owner1Id, storeId)
      ).resolves.toEqual(true);
    }
  );
  itUnitIntegration("✅Remove store manager", async (testType) => {
    const storeId = "store1";
    const founderId = "founder1";
    const manager1Id = "manager1";
    await controllers.Jobs.InitializeStore(founderId, storeId);
    await expect(
      controllers.Jobs.isStoreManager(manager1Id, storeId)
    ).resolves.toEqual(false);
    await controllers.Jobs.makeStoreManager(founderId, storeId, manager1Id);
    await expect(
      controllers.Jobs.isStoreManager(manager1Id, storeId)
    ).resolves.toEqual(true);
    await controllers.Jobs.removeStoreManager(founderId, storeId, manager1Id);
    await expect(
      controllers.Jobs.isStoreManager(manager1Id, storeId)
    ).resolves.toEqual(false);
  });
  //a test for the bad case of trying to remove a store manager without being a store owner/founder
  itUnitIntegration(
    "❌Remove store manager fails because the user removing is not the appointer of the manager to be removed",
    async (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const owner1Id = "owner1";
      const manager1Id = "manager1";

      await controllers.Jobs.InitializeStore(founderId, storeId);
      await expect(
        controllers.Jobs.isStoreManager(manager1Id, storeId)
      ).resolves.toEqual(false);
      await controllers.Jobs.makeStoreManager(founderId, storeId, manager1Id);
      await expect(
        controllers.Jobs.isStoreManager(manager1Id, storeId)
      ).resolves.toEqual(true);
      await controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
      await expect(
        controllers.Jobs.isStoreOwner(owner1Id, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.removeStoreManager(owner1Id, storeId, manager1Id)
      ).rejects.toThrow();
    }
  );
});
describe("permissions", () => {
  itUnitIntegration(
    "✅System admin has the correct permissions",
    async (testType) => {
      //
      const AdminId = await controllers.Auth.register("admin", "admin");
      await controllers.Jobs.setInitialAdmin(AdminId);
      await expect(controllers.Jobs.isSystemAdmin(AdminId)).resolves.toEqual(
        true
      );
      await expect(
        controllers.Jobs.canCloseStorePermanently(AdminId, "store1")
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.canReceivePurchaseHistoryFromStore(AdminId, "store1")
      ).resolves.toEqual(true);
    }
  );

  itUnitIntegration(
    "✅Store founder has the correct permissions",
    async (testType) => {
      //
      const storeId = "store1";

      const founderId = "founder1";
      await controllers.Jobs.InitializeStore(founderId, storeId);
      await expect(
        controllers.Jobs.isStoreFounder(founderId, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.canActivateStore(founderId, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.canCloseStorePermanently(founderId, storeId)
      ).resolves.toEqual(false);
      await expect(
        controllers.Jobs.canCreateProductInStore(founderId, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.canRemoveProductFromStore(founderId, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.canEditProductInStore(founderId, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.canDeactivateStore(founderId, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.canReceivePurchaseHistoryFromStore(founderId, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.canRemoveMember(founderId)
      ).resolves.toEqual(false);
    }
  );
  itUnitIntegration(
    "✅Store Owner has the correct permissions",
    async (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const owner1Id = "owner1";
      await controllers.Jobs.InitializeStore(founderId, storeId);
      await controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
      await expect(
        controllers.Jobs.isStoreOwner(owner1Id, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.canActivateStore(owner1Id, storeId)
      ).resolves.toEqual(false);
      await expect(
        controllers.Jobs.canCloseStorePermanently(owner1Id, storeId)
      ).resolves.toEqual(false);
      await expect(
        controllers.Jobs.canCreateProductInStore(owner1Id, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.canRemoveProductFromStore(owner1Id, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.canEditProductInStore(owner1Id, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.canDeactivateStore(owner1Id, storeId)
      ).resolves.toEqual(false);
      await expect(
        controllers.Jobs.canReceivePurchaseHistoryFromStore(owner1Id, storeId)
      ).resolves.toEqual(true);
      await expect(controllers.Jobs.canRemoveMember(owner1Id)).resolves.toEqual(
        false
      );
    }
  );
  itUnitIntegration(
    "✅Store Manger has the correct default permissions",
    async (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const manager1Id = "manager1";
      await controllers.Jobs.InitializeStore(founderId, storeId);
      await controllers.Jobs.makeStoreManager(founderId, storeId, manager1Id);
      await expect(
        controllers.Jobs.isStoreManager(manager1Id, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.canActivateStore(manager1Id, storeId)
      ).resolves.toEqual(false);
      await expect(
        controllers.Jobs.canCloseStorePermanently(manager1Id, storeId)
      ).resolves.toEqual(false);
      await expect(
        controllers.Jobs.canCreateProductInStore(manager1Id, storeId)
      ).resolves.toEqual(false);
      await expect(
        controllers.Jobs.canRemoveProductFromStore(manager1Id, storeId)
      ).resolves.toEqual(false);
      await expect(
        controllers.Jobs.canEditProductInStore(manager1Id, storeId)
      ).resolves.toEqual(false);
      await expect(
        controllers.Jobs.canDeactivateStore(manager1Id, storeId)
      ).resolves.toEqual(false);
      await expect(
        controllers.Jobs.canReceivePurchaseHistoryFromStore(manager1Id, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.canRemoveMember(manager1Id)
      ).resolves.toEqual(false);
    }
  );
  itUnitIntegration(
    "✅Store Manger has the correct permissions after being granted permissions",
    async (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const manager1Id = "manager1";
      await controllers.Jobs.InitializeStore(founderId, storeId);
      await controllers.Jobs.makeStoreManager(founderId, storeId, manager1Id);
      await expect(
        controllers.Jobs.isStoreManager(manager1Id, storeId)
      ).resolves.toEqual(true);
      await expect(
        controllers.Jobs.canActivateStore(manager1Id, storeId)
      ).resolves.toEqual(false);
      await expect(
        controllers.Jobs.canCreateProductInStore(manager1Id, storeId)
      ).resolves.toEqual(false);
      await controllers.Jobs.setAddingProductToStorePermission(
        founderId,
        storeId,
        manager1Id,
        true
      );
      await expect(
        controllers.Jobs.canCreateProductInStore(manager1Id, storeId)
      ).resolves.toEqual(true);
      await controllers.Jobs.setAddingProductToStorePermission(
        founderId,
        storeId,
        manager1Id,
        false
      );
      await expect(
        controllers.Jobs.canCreateProductInStore(manager1Id, storeId)
      ).resolves.toEqual(false);
      await expect(
        controllers.Jobs.canRemoveProductFromStore(manager1Id, storeId)
      ).resolves.toEqual(false);
      await controllers.Jobs.setRemovingProductFromStorePermission(
        founderId,
        storeId,
        manager1Id,
        true
      );
      await expect(
        controllers.Jobs.canRemoveProductFromStore(manager1Id, storeId)
      ).resolves.toEqual(true);
      await controllers.Jobs.setRemovingProductFromStorePermission(
        founderId,
        storeId,
        manager1Id,
        false
      );
      await expect(
        controllers.Jobs.canRemoveProductFromStore(manager1Id, storeId)
      ).resolves.toEqual(false);
      await expect(
        controllers.Jobs.canEditProductInStore(manager1Id, storeId)
      ).resolves.toEqual(false);
      await controllers.Jobs.setEditingProductInStorePermission(
        founderId,
        storeId,
        manager1Id,
        true
      );
      await expect(
        controllers.Jobs.canEditProductInStore(manager1Id, storeId)
      ).resolves.toEqual(true);
      await controllers.Jobs.setEditingProductInStorePermission(
        founderId,
        storeId,
        manager1Id,
        false
      );
      await expect(
        controllers.Jobs.canEditProductInStore(manager1Id, storeId)
      ).resolves.toEqual(false);
    }
  );
  //fail
  itUnitIntegration(
    "❌Permissions are not granted because grantor is not the appointer",
    async (testType) => {
      //
      const storeId = "store1";
      const founderId = "founder1";
      const owner1Id = "owner1";
      const manager1Id = "manager1";
      await controllers.Jobs.InitializeStore(founderId, storeId);
      await controllers.Jobs.makeStoreOwner(founderId, storeId, owner1Id);
      await controllers.Jobs.makeStoreManager(founderId, storeId, manager1Id);
      await expect(
        controllers.Jobs.setAddingProductToStorePermission(
          owner1Id,
          storeId,
          manager1Id,
          true
        )
      ).rejects.toThrow();
      await expect(
        controllers.Jobs.setRemovingProductFromStorePermission(
          owner1Id,
          storeId,
          manager1Id,
          true
        )
      ).rejects.toThrow();
      await expect(
        controllers.Jobs.setEditingProductInStorePermission(
          owner1Id,
          storeId,
          manager1Id,
          true
        )
      ).rejects.toThrow();
    }
  );
});
