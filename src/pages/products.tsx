import ProductCard from "components/productCard";
import Gallery from "components/gallery";
import RateSlider from "components/slider";
import Input from "components/input";

const products = [
  {
    id: "f0f30ce3-b604-41d7-a3ec-89ed4f92cfb6",
    name: "Bespoke Fresh Car",
    quantity: 89812,
    price: 85401,
    category: "Tools",
    description:
      "Andy shoes are designed to keeping in mind durability as well as trends, the most stylish range of shoes & sandals",
  },
  {
    id: "a53b5aab-2bc2-4053-bb13-00ab0beeb7e9",
    name: "Handcrafted Steel Chips",
    quantity: 28082,
    price: 16453,
    category: "Garden",
    description:
      "New ABC 13 9370, 13.3, 5th Gen CoreA5-8250U, 8GB RAM, 256GB SSD, power UHD Graphics, OS 10 Home, OS Office A & J 2016",
  },
  {
    id: "a9f72f7e-8dfe-4ea5-915e-84c570846cff",
    name: "Recycled Metal Shirt",
    quantity: 70663,
    price: 4041,
    category: "Health",
    description:
      "The automobile layout consists of a front-engine design, with transaxle-type transmissions mounted at the rear of the engine and four wheel drive",
  },
  {
    id: "dc96a9bd-dd22-4f59-bd17-3096cdbc6073",
    name: "Handmade Fresh Gloves",
    quantity: 4422,
    price: 74320,
    category: "Industrial",
    description:
      "Ergonomic executive chair upholstered in bonded black leather and PVC padded seat and back for all-day comfort and support",
  },
  {
    id: "e3df71cc-597d-40df-ade6-0e196f68b856",
    name: "Refined Wooden Chicken",
    quantity: 90053,
    price: 83781,
    category: "Kids",
    description:
      "The Nagasaki Lander is the trademarked name of several series of Nagasaki sport bikes, that started with the 1984 ABC800J",
  },
  {
    id: "7a07347f-2fd4-4052-a402-c8acaf213711",
    name: "Elegant Bronze Bike",
    quantity: 63047,
    price: 6796,
    category: "Jewelery",
    description:
      "Andy shoes are designed to keeping in mind durability as well as trends, the most stylish range of shoes & sandals",
  },
  {
    id: "fa9d1e51-07fa-4004-aba7-f51d8cf3a526",
    name: "Electronic Rubber Pizza",
    quantity: 78445,
    price: 97053,
    category: "Grocery",
    description: "The Football Is Good For Training And Recreational Purposes",
  },
  {
    id: "119942b9-4848-4c9d-bae0-626a28245bc9",
    name: "Unbranded Metal Sausages",
    quantity: 72542,
    price: 99543,
    category: "Sports",
    description:
      "The beautiful range of Apple Naturalé that has an exciting mix of natural ingredients. With the Goodness of 100% Natural Ingredients",
  },
  {
    id: "99dd10bc-b2e3-4412-887a-f4c94ebbfcbf",
    name: "Electronic Bronze Cheese",
    quantity: 7895,
    price: 55589,
    category: "Kids",
    description: "The Football Is Good For Training And Recreational Purposes",
  },
  {
    id: "0abe7042-379f-411e-a83f-7685f7fe1240",
    name: "Elegant Wooden Keyboard",
    quantity: 68413,
    price: 8056,
    category: "Shoes",
    description:
      "New ABC 13 9370, 13.3, 5th Gen CoreA5-8250U, 8GB RAM, 256GB SSD, power UHD Graphics, OS 10 Home, OS Office A & J 2016",
  },
  {
    id: "6e259065-7899-4667-bbd0-b9366443896d",
    name: "Recycled Frozen Pizza",
    quantity: 29082,
    price: 77987,
    category: "Electronics",
    description:
      "New range of formal shirts are designed keeping you in mind. With fits and styling that will make you stand apart",
  },
];

export default function Home() {
  // const [products, setProducts] = useState<StoreProductDTO[]>([]);
  // useEffect(() => {
  //   setProducts(Array.from({ length: 11 }, generateProductDTO));
  // }, []);

  return (
    <>
      <div className="rounded-md shadow-sm sm:flex">
        <CategoryDropdown />
        <Input placeholder="Product name" className="border-e-2 border-s-2" />
        <Input placeholder="Keywords" />
      </div>
      <div className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-6">
        <div className="flex items-center gap-4">
          <span className="text-white">Product Rating</span>
          <RateSlider />
        </div>
        <div className="flex items-center justify-end gap-4">
          <span className="text-white">Store Rating</span>
          <RateSlider />
        </div>
      </div>
      <MinMaxPrice />
      <Gallery
        list={products}
        getId={(product) => product.id}
        getItem={(product) => <ProductCard product={product} />}
      />
    </>
  );
}

function CategoryDropdown() {
  return (
    <div className="hs-dropdown relative -ml-px -mt-px block w-full border-gray-200 bg-white text-sm shadow-sm first:rounded-t-lg last:rounded-b-lg focus:z-10 focus:border-blue-500 focus:ring-blue-500 sm:mt-0 sm:first:ml-0 sm:first:rounded-l-lg sm:first:rounded-tr-none sm:last:rounded-r-lg sm:last:rounded-bl-none">
      <button
        id="hs-dropdown-with-dividers"
        type="button"
        className="hs-dropdown-toggle relative inline-flex w-full items-center justify-center gap-2 rounded-t-lg bg-white px-4 py-3 align-middle text-sm font-medium text-gray-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white hover:bg-gray-50 sm:rounded-l-lg sm:rounded-tr-none"
      >
        Categories
        <DropdownSvg />
      </button>
      <div
        className="hs-dropdown-menu duration z-50 mt-2 hidden max-h-80 min-w-[15rem] divide-y divide-gray-200 overflow-auto rounded-lg bg-white p-2 py-2 opacity-0 shadow-md transition-[opacity,margin] scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-blue-300 first:pt-0 hs-dropdown-open:opacity-100"
        aria-labelledby="hs-dropdown-with-dividers"
      >
        <a
          className="flex items-center gap-x-3.5 rounded-md px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 hover:bg-gray-100"
          href="#"
        >
          Games
        </a>
        <a
          className="flex items-center gap-x-3.5 rounded-md px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 hover:bg-gray-100"
          href="#"
        >
          Food
        </a>
        {Array.from({ length: 30 }, (_, i) => (
          <a
            key={i}
            className="flex items-center gap-x-3.5 rounded-md px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 hover:bg-gray-100"
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
      <div className="inline-flex min-w-fit items-center rounded-l-md border border-r-0 border-gray-200 bg-gray-50 px-2">
        <span className="text-sm text-gray-600">$</span>
      </div>
      <Input placeholder="0.00" className="w-24" />
      <div className="inline-flex min-w-fit items-center border border-x-0 border-gray-200 bg-gray-50 px-2">
        <span className="text-sm font-bold text-gray-600">-</span>
      </div>
      <Input
        placeholder="∞"
        className="w-24 rounded-r-md last:rounded-bl-none"
      />
    </div>
  );
}

function DropdownSvg() {
  return (
    <svg
      className="h-2.5 w-2.5 text-gray-600 hs-dropdown-open:rotate-180"
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
