import Layout from "../../_layout";
import { useRouter } from "next/router";
import { z } from "zod";
import StoreNavbar from "components/storeNavbar";
import Input from "components/input";
import Button from "components/button";
import { SmallDropdown } from "components/dropdown";
import { toast } from "react-hot-toast";
import { Modal } from "components/modal";
import { api } from "server/communication/api";
import { cachedQueryOptions, onError } from "utils/query";
import { useGuestRedirect } from "utils/paths";
import { EditIcon, RemoveIcon } from "components/icons";
import { type PositionHolderDTO } from "server/domain/Jobs/PositionHolder";
import { roleTypeSchema } from "server/domain/Jobs/Role";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type RoleType } from "@prisma/client";
import { onJobChangeEvent } from "utils/events";
import { useEffect, useState } from "react";
import { type EditablePermission } from "server/domain/Jobs/Role";

const formSchema = z.object({
  role: roleTypeSchema,
  email: z.string().email(),
});

type FormValues = z.infer<typeof formSchema>;
type ManagerPermissionList = EditablePermission;

export default function Home() {
  useGuestRedirect();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "all",
    criteriaMode: "all",
    reValidateMode: "onChange",
  });
  const email = watch("email"); //! TODO DON'T DELETE. IT MAKES IT WORK
  const router = useRouter();
  const storeId = z.undefined().or(z.string()).parse(router.query.storeId);
  const { data: jobs, refetch: refetchJobsHierarchy } =
    api.stores.getJobsHierarchyOfStore.useQuery(
      { storeId: storeId as string },
      { ...cachedQueryOptions, enabled: !!storeId }
    );
  const { mutate: makeStoreOwner } = api.stores.makeStoreOwner.useMutation({
    ...cachedQueryOptions,
    onSuccess: () => {
      document.dispatchEvent(new Event(onJobChangeEvent));
    },
  });
  const { mutate: makeStoreManager } = api.stores.makeStoreManager.useMutation({
    ...cachedQueryOptions,
    onSuccess: () => {
      document.dispatchEvent(new Event(onJobChangeEvent));
      toast.success("Job added successfully");
    },
  });
  const { refetch: getAssignmentId } = api.auth.getMemberIdByEmail.useQuery(
    { email: getValues("email") },
    { ...cachedQueryOptions, enabled: false }
  );
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

  useEffect(() => {
    const refetchJobsHierarchyCallback = () => {
      void refetchJobsHierarchy();
    };
    document.addEventListener(onJobChangeEvent, refetchJobsHierarchyCallback);
    return () => {
      document.removeEventListener(
        onJobChangeEvent,
        refetchJobsHierarchyCallback
      );
    };
  }, [refetchJobsHierarchy]);

  const handleAssignment = handleSubmit(
    async (data) => {
      const { data: assignmentId } = await getAssignmentId();
      if (!assignmentId) {
        return;
      }
      if (data.role === "Owner") {
        makeStoreOwner({
          storeId: storeId as string,
          targetUserId: assignmentId,
        });
      } else if (data.role === "Manager") {
        makeStoreManager({
          storeId: storeId as string,
          targetUserId: assignmentId,
        });
      }
    },
    (e) => toast.error(Object.values(e)[0]?.message || "Something went wrong")
  );

  return (
    <Layout>
      <StoreNavbar storeId={storeId} />
      {isMyStore && (
        <>
          <div className="flex w-full max-w-md flex-wrap sm:flex-nowrap">
            <SmallDropdown
              options={
                [
                  { label: "Owner", value: "Owner" },
                  { label: "Manager", value: "Manager" },
                ] satisfies {
                  label: string;
                  value: RoleType;
                }[]
              }
              {...register("role")}
              className="rounded-b-none sm:w-40 sm:rounded-b-lg sm:rounded-br-none sm:rounded-tr-none"
            />
            <Input
              placeholder="Email"
              className="rounded-none"
              {...register("email")}
            />
            <Button
              glowClassName="w-full"
              glowContainerClassName="w-full sm:w-auto"
              className="h-full w-full rounded-t-lg sm:rounded-lg sm:rounded-l-none"
              onClick={() => void handleAssignment()}
            >
              Add
            </Button>
          </div>
        </>
      )}
      <div className="hs-accordion-group w-full" data-hs-accordion-always-open>
        {jobs && <Job job={jobs} />}
      </div>
    </Layout>
  );
}

function FounderIcon() {
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
        d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
      />
    </svg>
  );
}

function OwnerIcon() {
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
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

function ManagerIcon() {
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

function AccordionIcons() {
  return (
    <>
      <svg
        className="block h-3 w-3 text-gray-600 group-hover:text-gray-500 hs-accordion-active:hidden hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.62421 7.86L13.6242 7.85999"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8.12421 13.36V2.35999"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <svg
        className="hidden h-3 w-3 text-gray-600 group-hover:text-gray-500 hs-accordion-active:block hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.62421 7.86L13.6242 7.85999"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}

// const permissionFormSchema = z.object({
//   email: z
//     .string()
//     .nonempty("Email is required")
//     .email("Invalid email address"),
//   password: z.string().min(5, "Password must be at least 5 characters"),
// });

// type FormValues = z.infer<typeof formSchema>;

type JobProps = {
  job: PositionHolderDTO;
};

function Job({ job }: JobProps) {
  const router = useRouter();
  const storeId = z.undefined().or(z.string()).parse(router.query.storeId);
  const { mutate: removeStoreOwner } = api.stores.removeStoreOwner.useMutation({
    onError,
    onSuccess: () => {
      document.dispatchEvent(new Event(onJobChangeEvent));
      toast.success("Job removed successfully");
    },
  });
  const { mutate: removeStoreManager } =
    api.stores.removeStoreManager.useMutation({
      onError,
      onSuccess: () => {
        document.dispatchEvent(new Event(onJobChangeEvent));
        toast.success("Job removed successfully");
      },
    });
  const [managerId, setManagerId] = useState<string>("");
  const { data: managerPermissions, refetch: refetchManagerPermissions } =
    api.jobs.getPermissionsOfUser.useQuery(
      { userId: managerId, storeId: storeId as string },
      { enabled: !!managerId }
    );

  const { mutate: setAddingProductPermission } =
    api.stores.setAddingProductPermission.useMutation({
      ...cachedQueryOptions,
      onSuccess: () => void refetchManagerPermissions(),
    });
  const { mutate: setEditingProductInStorePermission } =
    api.stores.setEditingProductInStorePermission.useMutation({
      ...cachedQueryOptions,
      onSuccess: () => void refetchManagerPermissions(),
    });
  const { mutate: setModifyingPurchasePolicyPermission } =
    api.stores.setModifyingPurchasePolicyPermission.useMutation({
      ...cachedQueryOptions,
      onSuccess: () => void refetchManagerPermissions(),
    });
  const { mutate: setReceivingPrivateStoreDataPermission } =
    api.stores.setReceivingPrivateStoreDataPermission.useMutation({
      ...cachedQueryOptions,
      onSuccess: () => void refetchManagerPermissions(),
    });
  const { mutate: setRemovingProductFromStorePermission } =
    api.stores.setRemovingProductFromStorePermission.useMutation({
      ...cachedQueryOptions,
      onSuccess: () => void refetchManagerPermissions(),
    });

  const handleRemoval = (job: PositionHolderDTO) => {
    if (job.role.roleType === "Owner") {
      removeStoreOwner({
        storeId: job.storeId,
        targetUserId: job.userId,
      });
    } else if (job.role.roleType === "Manager") {
      removeStoreManager({
        storeId: job.storeId,
        targetUserId: job.userId,
      });
    } else {
      toast.error("User cannot be removed. Incident will be reported");
    }
  };

  return (
    <div
      className="hs-accordion active"
      id={`hs-basic-always-open-heading-${job.userId}`}
    >
      <button
        className="hs-accordion-toggle peer inline-flex items-center gap-x-3 py-3 text-left font-semibold text-gray-800 transition hs-accordion-active:text-blue-600 hover:text-gray-500"
        aria-controls={`hs-basic-always-open-collapse-${job.userId}`}
      >
        {/* <AccordionIcons /> */}
        {job.role.roleType === "Founder" && <FounderIcon />}
        {job.role.roleType === "Owner" && <OwnerIcon />}
        {job.role.roleType === "Manager" && <ManagerIcon />}
        {job.email} - {job.role.roleType}
      </button>
      <button
        className="ml-2 peer-hover:opacity-100 hover:opacity-100 sm:opacity-0"
        data-hs-overlay={`#hs-modal-${job.userId}`}
      >
        <RemoveIcon />
      </button>
      <Modal
        id={`hs-modal-${job.userId}`}
        title="Confirm deletion"
        content={`Are you sure you want to remove ${job.email ?? "unknown"} (${
          job.role.roleType
        }) and the subordinates from the store?`}
        footer={
          <Button
            onClick={() => handleRemoval(job)}
            data-hs-overlay={`#hs-modal-${job.userId}`}
          >
            Apply changes
          </Button>
        }
      />
      {job.role.roleType === "Manager" && (
        <>
          <button
            className="ml-2 peer-hover:opacity-100 hover:opacity-100 sm:opacity-0"
            data-hs-overlay={`#hs-modal-${job.userId}-edit`}
            onClick={() => {
              setManagerId(job.userId);
              void refetchManagerPermissions();
            }}
          >
            <EditIcon />
          </button>
          <Modal
            id={`hs-modal-${job.userId}-edit`}
            title="Edit Permissions"
            content={
              <div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="checkbox-add-product"
                      checked={managerPermissions?.includes("AddProduct")}
                      className="relative h-7 w-[3.25rem] shrink-0 cursor-pointer appearance-none rounded-full border-2 border-transparent bg-gray-200 ring-1 ring-transparent ring-offset-white transition-colors duration-200 ease-in-out before:inline-block before:h-6 before:w-6 before:translate-x-0 before:transform before:rounded-full before:bg-white before:shadow before:ring-0 before:transition before:duration-200 before:ease-in-out checked:bg-blue-600 checked:bg-none checked:before:translate-x-full checked:before:bg-blue-200 focus:border-blue-600 focus:outline-none focus:ring-blue-600"
                      onClick={(e) => {
                        const target = e.target as HTMLInputElement;
                        setAddingProductPermission({
                          permission: target.checked,
                          storeId: storeId as string,
                          targetUserId: managerId,
                        });
                      }}
                    />
                    <label
                      htmlFor="checkbox-add-product"
                      className="ml-3 text-sm text-gray-500"
                    >
                      Add Product
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="checkbox-edit-product"
                      checked={managerPermissions?.includes(
                        "EditProductDetails"
                      )}
                      className="relative h-7 w-[3.25rem] shrink-0 cursor-pointer appearance-none rounded-full border-2 border-transparent bg-gray-200 ring-1 ring-transparent ring-offset-white transition-colors duration-200 ease-in-out before:inline-block before:h-6 before:w-6 before:translate-x-0 before:transform before:rounded-full before:bg-white before:shadow before:ring-0 before:transition before:duration-200 before:ease-in-out checked:bg-blue-600 checked:bg-none checked:before:translate-x-full checked:before:bg-blue-200 focus:border-blue-600 focus:outline-none focus:ring-blue-600"
                      onClick={(e) => {
                        const target = e.target as HTMLInputElement;
                        setEditingProductInStorePermission({
                          permission: target.checked,
                          storeId: storeId as string,
                          targetUserId: managerId,
                        });
                      }}
                    />
                    <label
                      htmlFor="checkbox-edit-product"
                      className="ml-3 text-sm text-gray-500"
                    >
                      Edit Product
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="checkbox-modify-purchase-policy"
                      checked={managerPermissions?.includes(
                        "ModifyPurchasePolicy"
                      )}
                      className="relative h-7 w-[3.25rem] shrink-0 cursor-pointer appearance-none rounded-full border-2 border-transparent bg-gray-200 ring-1 ring-transparent ring-offset-white transition-colors duration-200 ease-in-out before:inline-block before:h-6 before:w-6 before:translate-x-0 before:transform before:rounded-full before:bg-white before:shadow before:ring-0 before:transition before:duration-200 before:ease-in-out checked:bg-blue-600 checked:bg-none checked:before:translate-x-full checked:before:bg-blue-200 focus:border-blue-600 focus:outline-none focus:ring-blue-600"
                      onClick={(e) => {
                        const target = e.target as HTMLInputElement;
                        setModifyingPurchasePolicyPermission({
                          permission: target.checked,
                          storeId: storeId as string,
                          targetUserId: managerId,
                        });
                      }}
                    />
                    <label
                      htmlFor="checkbox-modify-purchase-policy"
                      className="ml-3 text-sm text-gray-500"
                    >
                      Modify Purchase Policy
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="checkbox-get-private-data"
                      checked={managerPermissions?.includes(
                        "receivePrivateStoreData"
                      )}
                      className="relative h-7 w-[3.25rem] shrink-0 cursor-pointer appearance-none rounded-full border-2 border-transparent bg-gray-200 ring-1 ring-transparent ring-offset-white transition-colors duration-200 ease-in-out before:inline-block before:h-6 before:w-6 before:translate-x-0 before:transform before:rounded-full before:bg-white before:shadow before:ring-0 before:transition before:duration-200 before:ease-in-out checked:bg-blue-600 checked:bg-none checked:before:translate-x-full checked:before:bg-blue-200 focus:border-blue-600 focus:outline-none focus:ring-blue-600"
                      onClick={(e) => {
                        const target = e.target as HTMLInputElement;
                        setReceivingPrivateStoreDataPermission({
                          permission: target.checked,
                          storeId: storeId as string,
                          targetUserId: managerId,
                        });
                      }}
                    />
                    <label
                      htmlFor="checkbox-get-private-data"
                      className="ml-3 text-sm text-gray-500"
                    >
                      Get Private Data
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="checkbox-remove-product"
                      checked={managerPermissions?.includes("RemoveProduct")}
                      className="relative h-7 w-[3.25rem] shrink-0 cursor-pointer appearance-none rounded-full border-2 border-transparent bg-gray-200 ring-1 ring-transparent ring-offset-white transition-colors duration-200 ease-in-out before:inline-block before:h-6 before:w-6 before:translate-x-0 before:transform before:rounded-full before:bg-white before:shadow before:ring-0 before:transition before:duration-200 before:ease-in-out checked:bg-blue-600 checked:bg-none checked:before:translate-x-full checked:before:bg-blue-200 focus:border-blue-600 focus:outline-none focus:ring-blue-600"
                      onClick={(e) => {
                        const target = e.target as HTMLInputElement;
                        setRemovingProductFromStorePermission({
                          permission: target.checked,
                          storeId: storeId as string,
                          targetUserId: managerId,
                        });
                      }}
                    />
                    <label
                      htmlFor="checkbox-remove-product"
                      className="ml-3 text-sm text-gray-500"
                    >
                      Remove Product
                    </label>
                  </div>
                </div>
              </div>
            }
            footer={<></>}
          />
        </>
      )}
      <div
        id={`hs-basic-always-open-collapse-${job.userId}`}
        className="hs-accordion-content w-full overflow-hidden pl-6 transition-[height] duration-300"
        aria-labelledby={`hs-basic-always-open-heading-${job.userId}`}
      >
        {job.assignedPositionHolders.map((assignment) => (
          <Job key={assignment.userId} job={assignment} />
        ))}
      </div>
    </div>
  );
}
