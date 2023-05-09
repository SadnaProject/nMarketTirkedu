const PATHS = {
  home: { path: "/" },
  register: { path: "/register" },
  login: { path: "/login" },
  products: { path: "/products" },
  product: { path: (productId: string) => `/product/${productId}` },
  stores: { path: "/stores" },
  store: { path: (storeId: string) => `/store/${storeId}` },
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
