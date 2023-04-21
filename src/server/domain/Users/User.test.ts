import { describe , expect, it } from "vitest";
import { randomUUID } from "crypto";
import {User} from "./User";
import { Notification } from "./Notification";
describe("addProduct", () => {
    it("should add a product to the basket", () => {
        const user = new User(randomUUID());
        const productId = randomUUID();
        const quantity = 1;
        const storeId = randomUUID();
        user.addProductToCart(productId, quantity, storeId);
        expect(user.Cart.storeIdToBasket.get(storeId)?.products.length).toBe(1);
        expect(user.Cart.storeIdToBasket.get(storeId)?.products.filter((p)=> p.storeProductId === productId)[0]?.quantity).toBe(quantity);
        user.addProductToCart(productId, quantity + 1, storeId);
        expect(user.Cart.storeIdToBasket.get(storeId)?.products.filter((p)=> p.storeProductId === productId)[0]?.quantity).toBe(quantity+1);
        
    });
    it("should override the quantity if the product already exists in the basket", () => {
        const user = new User(randomUUID());
        const productId = randomUUID();
        const quantity = 1;
        const storeId = randomUUID();
        user.addProductToCart(productId, quantity, storeId);
        expect(()=> user.addProductToCart(productId, - 1, storeId)).toThrow();
    });
    }
);
describe("removeProduct", () => {
    it("should remove a product from the basket", () => {
        const user = new User(randomUUID());
        const productId = randomUUID();
        const quantity = 1;
        const storeId = randomUUID();
        user.addProductToCart(productId, quantity, storeId);
        user.removeProductFromCart(productId, storeId);
        expect(user.Cart.storeIdToBasket.get(storeId)?.products.filter((p)=> p.storeProductId === productId).length).toBe(0);

    });
    it("should throw an error if the product is not in the basket", () => {
        const user = new User(randomUUID());
        const productId = randomUUID();
        const quantity = 1;
        const storeId = randomUUID();
        user.addProductToCart(productId, quantity, storeId);
        expect(() => user.removeProductFromCart(randomUUID(), storeId)).toThrow();
    });
    }
);
describe("editProductQuantity", () => {
    it("should edit the quantity of a product in the basket", () => {
        const user = new User(randomUUID());
        const productId = randomUUID();
        const quantity = 1;
        const storeId = randomUUID();
        user.addProductToCart(productId, quantity, storeId);
        user.editProductQuantityInCart(productId,  storeId,quantity + 1);
        expect(user.Cart.storeIdToBasket.get(storeId)?.products.filter((p)=> p.storeProductId === productId)[0]?.quantity).toBe(quantity+1);
        user.editProductQuantityInCart(productId, storeId, quantity);
        expect(user.Cart.storeIdToBasket.get(storeId)?.products.filter((p)=> p.storeProductId === productId)[0]?.quantity).toBe(quantity);
        user.editProductQuantityInCart(productId, storeId, 0);
        expect(user.Cart.storeIdToBasket.get(storeId)?.products.filter((p)=> p.storeProductId === productId).length).toBe(0);
    });
    it("should remove the product from the basket if the quantity is below 0", () => {
        const user = new User(randomUUID());
        const productId = randomUUID();
        const quantity = 1;
        const storeId = randomUUID();
        user.addProductToCart(productId, quantity, storeId);
        expect(()=>user.editProductQuantityInCart(productId, storeId,-1)).toThrow();
    });
    }
);
describe("addNotification", () => {
    it("should add a notification to the user", () => {
        const user = new User(randomUUID());
        user.addNotification(new Notification(  "test","test"));
        expect(user.Notifications.length).toBe(1);
    });
    }
);
describe("readNotification", () => {
    it("should read a notification", () => {
        const user = new User(randomUUID());
        const notification =new Notification(  "test","test");
        const notificationId = notification.Id;
        user.addNotification(notification);
        user.readNotification(notificationId);
        expect(user.Notifications.filter((n)=> n.Id === notificationId)[0]?.IsRead).toBe(true);
    });
    it("should throw an error if the notification is not found", () => {
        const user = new User(randomUUID());
        const notificationId = randomUUID();
        expect(()=>user.readNotification(notificationId)).toThrow();
    });
    }
);