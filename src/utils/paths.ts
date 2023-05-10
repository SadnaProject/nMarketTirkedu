import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const PATHS = {
  home: { path: "/" },
  register: { path: "/register" },
  login: { path: "/login" },
  products: { path: "/products" },
  product: { path: (productId: string) => `/product/${productId}` },
  stores: { path: "/stores" },
  store: { path: (storeId: string) => `/store/${storeId}` },
  createStore: { path: "/createStore" },
  storeJobs: { path: (storeId: string) => `/store/${storeId}/jobs` },
  storeRevenue: { path: (storeId: string) => `/store/${storeId}/revenue` },
  createProduct: {
    path: (storeId: string) => `/store/${storeId}/createProduct`,
  },
  editProduct: {
    path: (storeId: string, productId: string) =>
      `/store/${storeId}/editProduct/${productId}`,
  },
  myStores: { path: "/myStores" },
  myReceipts: { path: "/myReceipts" },
  receipt: { path: (receiptId: string) => `/receipt/${receiptId}` },
  chat: { path: (uid: string) => `/chat/${uid}` },
  cart: { path: "/cart" },
} as const;
export default PATHS;

export function useMemberRedirect() {
  const router = useRouter();
  const { status, data: session } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session.user.type === "member") {
      void router.push(PATHS.home.path);
    }
  }, [status, session, router]);
}

export function useGuestRedirect() {
  const router = useRouter();
  const { status, data: session } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session.user.type === "guest") {
      void router.push(PATHS.home.path);
    }
  }, [status, session, router]);
}
