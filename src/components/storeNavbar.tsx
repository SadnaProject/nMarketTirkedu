import Link from "next/link";
import { useRouter } from "next/router";
import { twMerge } from "tailwind-merge";
import PATHS from "utils/paths";
import { BookIcon, EyeClosedIcon, EyeIcon, TrashIcon } from "./icons";
import { api } from "server/communication/api";
import { useEffect, useState } from "react";
import { cachedQueryOptions } from "utils/query";
import Button from "./button";
import { Modal } from "./modal";

type Props = {
  storeId: string | undefined;
};

export default function StoreNavbar({ storeId }: Props) {
  const router = useRouter();
  const { data: isSystemAdmin } = api.jobs.isSystemAdmin.useQuery(
    undefined,
    cachedQueryOptions
  );
  const { data: storeName } = api.stores.getStoreNameById.useQuery(
    { storeId: storeId as string },
    { ...cachedQueryOptions, enabled: !!storeId }
  );
  const { mutate: closeStorePermanently } =
    api.stores.closeStorePermanently.useMutation({
      ...cachedQueryOptions,
      onSuccess: () => router.push(PATHS.stores.path),
    });
  const { data: myStores } = api.stores.myStores.useQuery(
    undefined,
    cachedQueryOptions
  );
  const [isMyStore, setIsMyStore] = useState(false);
  useEffect(() => {
    if (myStores) {
      setIsMyStore(myStores.some((myStore) => myStore.store.id === storeId));
    }
  }, [myStores, storeId]);
  const { mutate: activateStore } = api.stores.activateStore.useMutation({
    ...cachedQueryOptions,
    onSuccess: () => {
      console.log("activated");
      void refetchIsStoreActive();
    },
  });
  const { mutate: deactivateStore } = api.stores.deactivateStore.useMutation({
    ...cachedQueryOptions,
    onSuccess: () => {
      console.log("deactivated");
      void refetchIsStoreActive();
    },
  });
  const { data: isStoreActive, refetch: refetchIsStoreActive } =
    api.stores.isStoreActive.useQuery(
      { storeId: storeId as string },
      { ...cachedQueryOptions, enabled: !!storeId }
    );

  function handleChangeStoreActivation() {
    if (isStoreActive) {
      deactivateStore({ storeId: storeId as string });
    } else {
      activateStore({ storeId: storeId as string });
    }
  }

  const links = [
    {
      name: "Products",
      href: PATHS.store.path(storeId ?? ""),
      icon: <OverviewIcon />,
      visible: true,
    },
    {
      name: "Jobs",
      href: PATHS.storeJobs.path(storeId ?? ""),
      icon: <JobsIcon />,
      visible: isMyStore || isSystemAdmin,
    },
    {
      name: "Make Owner Requests",
      href: PATHS.storeMakeOwnerRequests.path(storeId ?? ""),
      icon: <></>,
      visible: isMyStore,
    },
    {
      name: "Revenue",
      href: PATHS.storeRevenue.path(storeId ?? ""),
      icon: <RevenueIcon />,
      visible: isMyStore || isSystemAdmin,
    },
    {
      name: "Discounts",
      href: PATHS.storeDiscounts.path(storeId ?? ""),
      icon: <DiscountIcon />,
      visible: true,
    },
    {
      name: "Policy",
      href: PATHS.storePolicy.path(storeId ?? ""),
      icon: <BookIcon />,
      visible: true,
    },
  ];

  return (
    <>
      {storeId && (
        <>
          <div className="flex items-center gap-2">
            <h1>{storeName}</h1>
            {isSystemAdmin && (
              <button data-hs-overlay={"#hs-modal-perm-close"}>
                <TrashIcon />
              </button>
            )}
            {isMyStore && (
              <button onClick={() => void handleChangeStoreActivation()}>
                {isStoreActive ? <EyeIcon /> : <EyeClosedIcon />}
              </button>
            )}
            <Modal
              id={"hs-modal-perm-close"}
              title="Confirm permanent closure"
              content={
                <>
                  Are you sure you want to close the store permanently?
                  <br />
                  This action cannot be undone.
                </>
              }
              footer={
                <Button
                  onClick={() => closeStorePermanently({ storeId })}
                  data-hs-overlay={"#hs-modal-perm-close"}
                >
                  Close store permanently
                </Button>
              }
            />
          </div>

          <nav className="flex w-full max-w-2xl space-x-2 overflow-x-auto">
            {links
              .filter((link) => link.visible)
              .map((link) => (
                <Link
                  key={link.name}
                  className={twMerge(
                    "inline-flex grow basis-0 items-center justify-center gap-2 rounded-lg px-4 py-3 text-center text-sm font-medium",
                    router.asPath.split("?")[0] === link.href
                      ? "bg-blue-600 text-white"
                      : "bg-transparent text-gray-500 hover:text-blue-600"
                  )}
                  href={link.href}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
          </nav>
        </>
      )}
    </>
  );
}

function OverviewIcon() {
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
        d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
      />
    </svg>
  );
}

function JobsIcon() {
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
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  );
}

function RevenueIcon() {
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
        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
      />
    </svg>
  );
}

function DiscountIcon() {
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
        d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}
