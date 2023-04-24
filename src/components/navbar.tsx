import Link from "next/link";
import { useRouter } from "next/router";
import PATHS from "utils/paths";
import classnames from "classnames";
import { useSession } from "next-auth/react";
import Glow from "./glow";
import Image from "next/image";

const links = [
  { name: "Products", path: PATHS.products.path },
  { name: "Stores", path: PATHS.stores.path },
] as const;

export default function Navbar() {
  const router = useRouter();
  const activeLink = links.find((link) => link.path === router.pathname);
  const { data: session } = useSession();

  return (
    <header className="flex w-full flex-wrap bg-white py-4 text-sm drop-shadow-xl sm:flex-nowrap sm:justify-start">
      <nav
        className="mx-auto w-full max-w-[85rem] px-4 sm:flex sm:items-center sm:justify-between"
        aria-label="Global"
      >
        <div className="flex items-center justify-between">
          <Link href={PATHS.home.path}>
            <svg
              className="h-auto w-9"
              fill="var(--primary)"
              xmlns="http://www.w3.org/2000/svg"
              width="200"
              zoomAndPan="magnify"
              viewBox="0 0 375 374.999991"
              height="200"
            >
              <g>
                <path
                  id="pathAttribute"
                  d="M 344.105469 366.273438 L 32.230469 366.273438 C 19.386719 366.273438 8.917969 355.808594 8.917969 342.960938 L 8.917969 31.085938 C 8.917969 18.242188 19.386719 7.773438 32.230469 7.773438 L 344.105469 7.773438 C 356.949219 7.773438 367.417969 18.242188 367.417969 31.085938 L 367.417969 342.960938 C 367.417969 355.808594 356.949219 366.273438 344.105469 366.273438 "
                  fillOpacity="1"
                  fillRule="nonzero"
                ></path>
              </g>
              <g id="inner-icon" transform="translate(10,10) scale(1.78)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="200"
                  height="200"
                  viewBox="0 0 24 24"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M7 20v-16l10 16v-16"
                    id="mainIconPathAttribute"
                  ></path>
                </svg>
              </g>
            </svg>
          </Link>
          <div className="sm:hidden">
            <button
              type="button"
              className="hs-collapse-toggle inline-flex items-center justify-center gap-2 rounded-md border bg-white p-2 align-middle text-sm font-medium text-gray-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white hover:bg-gray-50"
              data-hs-collapse="#navbar-image-1"
              aria-controls="navbar-image-1"
              aria-label="Toggle navigation"
            >
              <svg
                className="h-4 w-4 hs-collapse-open:hidden"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                />
              </svg>
              <svg
                className="hidden h-4 w-4 hs-collapse-open:block"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>
        </div>
        <div
          id="navbar-image-1"
          className="hs-collapse hidden grow basis-full overflow-hidden transition-all duration-300 sm:block"
        >
          <div className="mt-5 flex flex-col gap-5 sm:mt-0 sm:flex-row sm:items-center sm:justify-end sm:pl-5">
            {links.map((link) => (
              <Link
                key={link.name}
                className={classnames(
                  "font-medium hover:text-primary",
                  link.path === activeLink?.path
                    ? "text-primary"
                    : "text-gray-600"
                )}
                href={link.path}
              >
                {link.name}
              </Link>
            ))}
            {session ? (
              <button>
                <span className="inline-flex h-[2.375rem] w-[2.375rem] items-center justify-center rounded-full bg-primary">
                  <span className="text-lg font-medium leading-none text-white">
                    O
                  </span>
                </span>
              </button>
            ) : (
              <Glow className="peer-hover:blur-sm">
                <Link href={PATHS.signup.path}>
                  <div className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-semibold text-white transition-all">
                    Sign Up
                  </div>
                </Link>
              </Glow>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
