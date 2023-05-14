import Link from "next/link";
import { useRouter } from "next/router";
import PATHS from "utils/paths";
import { signOut, useSession } from "next-auth/react";
import { GlowOnHover } from "./glow";
import Button from "./button";
import ButtonLight from "./buttonLight";
import { twMerge } from "tailwind-merge";
import Profile from "./profile";
import Price from "./price";
import { api } from "utils/api";
import { onError } from "utils/query";
import Badge from "./Badge";

const publicLinks = [
  { name: "Products", path: PATHS.products.path },
  { name: "Stores", path: PATHS.stores.path },
] as const;

const privateLinks = [
  { name: "My Stores", path: PATHS.myStores.path },
  // { name: "My Receipts", path: PATHS.myReceipts.path },
] as const;

export default function Navbar() {
  const router = useRouter();
  const activeLink = [...publicLinks, ...privateLinks].find(
    (link) => link.path === router.pathname
  );
  const { mutate: serverSignOut } = api.users.logoutMember.useMutation({
    onSuccess: async () => {
      await signOut();
    },
    onError,
  });
  const { data: session } = useSession();
  const { data: notifications, refetch: refetchNotifications } =
    api.users.getNotifications.useQuery();
  api.example.onAddNotificationEvent.useSubscription(undefined, {
    onData: () => void refetchNotifications(),
  });
  const { data: cartPrice } = api.stores.getCartPrice.useQuery();

  return (
    <header className="flex w-full flex-wrap bg-white text-sm drop-shadow-xl sm:flex-nowrap sm:justify-start">
      <nav
        className="mx-auto w-full max-w-[85rem] overflow-hidden px-4 py-4 sm:flex sm:items-center sm:justify-between"
        aria-label="Global"
      >
        <div className="flex items-center justify-between">
          <HomeButton />
          <div className="sm:hidden">
            <MenuButton />
          </div>
        </div>
        <div
          id="navbar-image-1"
          className="hs-collapse hidden grow basis-full transition-all duration-300 sm:block"
        >
          <div className="mt-5 flex flex-col gap-5 sm:mt-0 sm:flex-row sm:items-center sm:justify-end sm:pl-5">
            {publicLinks.map((link) => (
              <Link
                key={link.name}
                className={twMerge(
                  "font-medium hover:text-primary",
                  link.path === activeLink?.path
                    ? "text-primary"
                    : "text-slate-600"
                )}
                href={link.path}
              >
                {link.name}
              </Link>
            ))}
            {privateLinks.map((link) => (
              <Link
                key={link.name}
                className={twMerge(
                  "font-medium hover:text-primary",
                  link.path === activeLink?.path
                    ? "text-primary"
                    : "text-slate-600"
                )}
                href={link.path}
              >
                {link.name}
              </Link>
            ))}
            <Link href={PATHS.cart.path} passHref legacyBehavior>
              <ButtonLight>
                <CartIcon className="h-4 w-4" />
                {cartPrice !== undefined && (
                  <Price
                    price={cartPrice}
                    className="-my-10"
                    dollarClassName="text-sm"
                    integerClassName="text-lg"
                    decimalClassName="text-xs"
                  />
                )}
              </ButtonLight>
            </Link>
            {session?.user.type === "member" ? (
              <>
                <div className="hs-dropdown relative inline-flex w-fit">
                  <ButtonLight id="hs-dropdown-with-dividers">
                    <BellIcon />
                    {notifications?.length !== undefined &&
                      notifications?.length > 0 && (
                        <span className="absolute right-0 top-0 inline-flex -translate-y-1/2 translate-x-1/2 transform items-center rounded-full bg-rose-800 px-1.5 py-0.5 text-xs font-medium text-white">
                          {notifications?.length}
                        </span>
                      )}
                  </ButtonLight>
                  <div
                    className="hs-dropdown-menu duration shadow-middle z-10 mt-2 hidden max-h-80 min-w-[15rem] divide-y divide-gray-200 overflow-auto rounded-lg bg-white p-2 opacity-0 shadow-md transition-[opacity,margin] hs-dropdown-open:opacity-100"
                    aria-labelledby="hs-dropdown-with-dividers"
                  >
                    <div className="py-2 first:pt-0 last:pb-0">
                      {notifications?.map((notification) => (
                        <Link
                          key={notification.Id}
                          passHref
                          legacyBehavior
                          href={PATHS.receipt.path("todo")}
                        >
                          <div className="flex cursor-pointer items-center gap-x-1.5 rounded-md px-3 py-2 text-sm text-slate-800 hover:bg-slate-100 focus:ring-2 focus:ring-blue-500">
                            <CashIcon />
                            <div className="flex items-center gap-x-1">
                              <Link href={PATHS.chat.path("todo")}>
                                <Badge>Omer</Badge>
                              </Link>
                              bought from
                              <Link href={PATHS.store.path("todo")}>
                                <Badge>H&M</Badge>
                              </Link>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                <Profile
                  id={session.user.id}
                  onClick={() => void serverSignOut()}
                />
              </>
            ) : (
              <Link href={PATHS.login.path} passHref legacyBehavior>
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

function HomeButton() {
  return (
    <GlowOnHover>
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
              <path d="M7 20v-16l10 16v-16" id="mainIconPathAttribute"></path>
            </svg>
          </g>
        </svg>
      </Link>
    </GlowOnHover>
  );
}

function MenuButton() {
  return (
    <ButtonLight
      className="hs-collapse-toggle p-2 "
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
    </ButtonLight>
  );
}

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={twMerge("h-6 w-6", className)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );
}
