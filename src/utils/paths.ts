import { type Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

type UserType = Session["user"]["type"] | "admin";

type Path = {
  path: string | ((...args: string[]) => string);
  for: readonly UserType[];
};

const PATHS = {
  home: { path: "/", for: ["guest", "member"] },
  register: { path: "/register", for: ["guest"] },
  login: { path: "/login", for: ["guest"] },
  products: { path: "/products", for: ["guest", "member"] },
  product: {
    path: (productId: string) => `/product/${productId}`,
    for: ["guest", "member"],
  },
  editProduct: {
    path: (productId: string) => `/product/${productId}/edit`,
    for: ["member"],
  },
  stores: { path: "/stores", for: ["guest", "member"] },
  store: {
    path: (storeId: string) => `/store/${storeId}`,
    for: ["guest", "member"],
  },
  createStore: { path: "/createStore", for: ["member"] },
  storeJobs: {
    path: (storeId: string) => `/store/${storeId}/jobs`,
    for: ["member"],
  },
  storeRevenue: {
    path: (storeId: string) => `/store/${storeId}/revenue`,
    for: ["member"],
  },
  storeDiscounts: {
    path: (storeId: string) => `/store/${storeId}/discounts`,
    for: ["member"],
  },
  storePolicy: {
    path: (storeId: string) => `/store/${storeId}/policy`,
    for: ["member"],
  },
  createProduct: {
    path: (storeId: string) => `/store/${storeId}/createProduct`,
    for: ["member"],
  },
  myStores: { path: "/myStores", for: ["member"] },
  myReceipts: { path: "/myReceipts", for: ["member"] },
  receipt: {
    path: (receiptId: string) => `/receipt/${receiptId}`,
    for: ["guest", "member"],
  },
  chat: { path: (uid: string) => `/chat/${uid}`, for: ["member"] },
  cart: { path: "/cart", for: ["guest", "member"] },
  adminPanel: { path: "/admin", for: ["admin"] },
} as const satisfies Record<string, Path>;
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

export function useCheckRedirect() {
  const router = useRouter();
  const { status, data: session } = useSession();

  useEffect(() => {
    const path =
      PATHS[(router.asPath.split("?")[0] || "/") as keyof typeof PATHS];
    console.log(router.asPath.split("?")[0]);
    console.log(path);

    if (!path || !session?.user.type) return;
    const pathFor = path.for as readonly UserType[];
    if (!pathFor.includes(session.user.type)) {
      if (status === "authenticated" && session.user.type === "member") {
        void router.replace(PATHS.home.path);
      }
      if (status === "authenticated" && session.user.type === "guest") {
        void router.push(PATHS.home.path);
      }
    }
  }, [router, status, session?.user.type]);
}
