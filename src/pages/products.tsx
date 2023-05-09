import Gallery from "components/gallery";
import RateSlider from "components/slider";
import Input from "components/input";
import Layout from "./_layout";
import PATHS from "utils/paths";
import Link from "next/link";
import { ProductCard } from "components/productCard";
import { api } from "utils/api";

export default function Home() {
  const { data: products } = api.stores.searchProducts.useQuery({});

  // const [products, setProducts] = useState<StoreProductDTO[]>([]);
  // useEffect(() => {
  //   setProducts(Array.from({ length: 11 }, generateProductDTO));
  // }, []);

  return (
    <Layout>
      <h1>Search Products</h1>
      <div className="rounded-md shadow-sm sm:flex">
        <CategoryDropdown />
        <Input placeholder="Product name" className="rounded-none" />
        <Input
          placeholder="Keywords"
          className="rounded-t-none sm:rounded-l-none sm:rounded-tr-lg"
        />
      </div>
      <div className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-6">
        <div className="flex items-center gap-4">
          <span className="text-slate-800">Product Rating</span>
          <RateSlider />
        </div>
        <div className="flex items-center justify-end gap-4">
          <span className="text-slate-800">Store Rating</span>
          <RateSlider />
        </div>
      </div>
      <MinMaxPrice />
      {products && (
        <Gallery
          list={products}
          getId={(product) => product.id}
          getItem={(product) => (
            <Link href={PATHS.product.path(product.id)}>
              <ProductCard product={product} />
            </Link>
          )}
        />
      )}
    </Layout>
  );
}

function CategoryDropdown() {
  return (
    <div className="hs-dropdown relative -ml-px -mt-px block w-full border-gray-200 bg-white text-sm shadow-sm first:rounded-t-lg last:rounded-b-lg focus:z-10 focus:border-blue-500 focus:ring-blue-500 sm:mt-0 sm:first:ml-0 sm:first:rounded-l-lg sm:first:rounded-tr-none sm:last:rounded-r-lg sm:last:rounded-bl-none">
      <button
        id="hs-dropdown-with-dividers"
        type="button"
        className="hs-dropdown-toggle relative inline-flex w-full items-center justify-center gap-2 rounded-t-lg border border-gray-300 bg-white px-4 py-3 align-middle text-sm font-medium text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white hover:bg-slate-50 sm:rounded-l-lg sm:rounded-tr-none"
      >
        Categories
        <DropdownSvg />
      </button>
      <div
        className="hs-dropdown-menu duration z-50 mt-2 hidden max-h-80 min-w-[15rem] divide-y divide-gray-200 overflow-auto rounded-lg bg-white p-2 py-2 opacity-0 shadow-md transition-[opacity,margin] scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-blue-300 first:pt-0 hs-dropdown-open:opacity-100"
        aria-labelledby="hs-dropdown-with-dividers"
      >
        <a
          className="flex items-center gap-x-3.5 rounded-md px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 hover:bg-slate-100"
          href="#"
        >
          Games
        </a>
        <a
          className="flex items-center gap-x-3.5 rounded-md px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 hover:bg-slate-100"
          href="#"
        >
          Food
        </a>
        {Array.from({ length: 30 }, (_, i) => (
          <a
            key={i}
            className="flex items-center gap-x-3.5 rounded-md px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 hover:bg-slate-100"
            href="#"
          >
            Electronics
          </a>
        ))}
      </div>
    </div>
  );
}

function MinMaxPrice() {
  return (
    <div className="flex shadow-sm">
      <div className="inline-flex min-w-fit items-center rounded-l-md border border-r-0 border-gray-300 bg-slate-50 px-2">
        <span className="text-sm text-slate-600">$</span>
      </div>
      <Input placeholder="0.00" className="w-24 rounded-none" />
      <div className="inline-flex min-w-fit items-center border-y border-gray-300 bg-slate-50 px-2">
        <span className="text-sm font-bold text-slate-600">-</span>
      </div>
      <Input placeholder="∞" className="w-24 rounded-l-none" />
    </div>
  );
}

function DropdownSvg() {
  return (
    <svg
      className="h-2.5 w-2.5 text-slate-600 hs-dropdown-open:rotate-180"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 5L8.16086 10.6869C8.35239 10.8637 8.64761 10.8637 8.83914 10.6869L15 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
