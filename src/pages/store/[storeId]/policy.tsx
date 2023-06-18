import Layout from "../../_layout";
import { useRouter } from "next/router";
import StoreNavbar from "components/storeNavbar";
import Button from "components/button";
import { SmallDropdown } from "components/dropdown";
import { toast } from "react-hot-toast";
import { Modal } from "components/modal";
import { api } from "server/communication/api";
import { cachedQueryOptions } from "utils/query";
import {
  CreateIcon,
  DocumentIcon,
  FolderIcon,
  RemoveIcon,
  SaveIcon,
  TimeIcon,
} from "components/icons";
import {
  conditionSchema,
  type ConditionArgs,
} from "server/domain/Stores/Conditions/CompositeLogicalCondition/Condition";
import Input from "components/input";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { onConstraintChangeEvent } from "utils/events";
import { twMerge } from "tailwind-merge";

const defaultCondition: ConditionArgs = {
  type: "Literal",
  amount: 0,
  conditionType: "Exactly",
  subType: "Product",
  searchFor: "",
};

export default function Home() {
  const router = useRouter();
  const { storeId } = router.query;
  const { mutate: addConstraint } = api.stores.addConstraintToStore.useMutation(
    {
      ...cachedQueryOptions,
      onSuccess: () => {
        document.dispatchEvent(new Event(onConstraintChangeEvent));
        toast.success("Constraint added successfully");
      },
    }
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
  const { data: constraints, refetch: refetchConstraints } =
    api.stores.getStoreConstraints.useQuery(
      { storeId: storeId as string },
      { ...cachedQueryOptions, enabled: !!storeId }
    );

  useEffect(() => {
    const refetchConstraintsCallback = () => {
      void refetchConstraints();
    };
    document.addEventListener(
      onConstraintChangeEvent,
      refetchConstraintsCallback
    );
    return () => {
      document.removeEventListener(
        onConstraintChangeEvent,
        refetchConstraintsCallback
      );
    };
  }, [refetchConstraints]);

  return (
    <Layout className="max-w-none">
      <StoreNavbar storeId={storeId as string} />
      <div
        className={twMerge(
          "hs-accordion-group flex w-full flex-col overflow-auto",
          isMyStore ? "" : "pointer-events-none"
        )}
        data-hs-accordion-always-open
      >
        <h2>Ordered by chronological update date:</h2>
        {constraints &&
          Object.entries(Object.fromEntries(constraints)).map(
            ([constraintId, constraint], i) => (
              <FullConstraint
                key={`constraint-${constraintId}`}
                constraint={constraint}
                id={constraintId}
              />
            )
          )}
      </div>
      {isMyStore && (
        <Button className="rounded-full" data-hs-overlay={`#hs-modal-create`}>
          <CreateIcon />
          Create
        </Button>
      )}
      <Modal
        id={`hs-modal-create`}
        title="Confirm creation"
        content={`Are you sure you want to create a new constraint? All unsaved changes will be lost.`}
        footer={
          <Button
            onClick={() =>
              addConstraint({
                storeId: storeId as string,
                constraint: defaultCondition,
              })
            }
            data-hs-overlay={`#hs-modal-create`}
          >
            Apply changes
          </Button>
        }
      />
    </Layout>
  );
}

type FullConstraintProps = {
  constraint: ConditionArgs;
  id: string;
};

function FullConstraint({ constraint: constraint, id }: FullConstraintProps) {
  const formMethods = useForm<ConditionArgs>({
    resolver: zodResolver(conditionSchema),
    defaultValues: constraint,
    mode: "all",
    criteriaMode: "all",
    reValidateMode: "onChange",
  });

  return (
    <FormProvider {...formMethods}>
      <Condition condition={formMethods.getValues()} id={id} />
    </FormProvider>
  );
}

type ConditionProps = {
  prefix?: string;
  condition: ConditionArgs;
  id?: string;
};

function Condition({ condition, prefix = "", id }: ConditionProps) {
  const router = useRouter();
  const { storeId } = router.query;
  const {
    register,
    formState: { errors }, //! DON'T DELETE THIS LINE. IT MAKES THE UI UPDATE
    handleSubmit,
  } = useFormContext<ConditionArgs>();
  const { mutate: removeConstraint } =
    api.stores.removeConstraintFromStore.useMutation({
      ...cachedQueryOptions,
      onSuccess: () => {
        document.dispatchEvent(new Event(onConstraintChangeEvent));
        toast.success("Change to constraint was made successfully");
      },
    });
  const { mutate: addConstraint } = api.stores.addConstraintToStore.useMutation(
    {
      ...cachedQueryOptions,
      onSuccess: () => {
        if (!id) return;
        removeConstraint({ storeId: storeId as string, constraintId: id });
      },
    }
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

  const getPath = useCallback(
    <T extends string>(field: T) => `${prefix}${field}` as T,
    [prefix]
  );

  const handleSave = handleSubmit(
    (data) => {
      console.log(data);
      addConstraint({
        storeId: storeId as string,
        constraint: data,
      });
    },
    () => {
      toast.error("Constraint is invalid");
    }
  );

  return (
    <div
      className="hs-accordion active"
      id={`hs-basic-always-open-heading-${prefix}`}
    >
      <button
        className="hs-accordion-toggle peer inline-flex items-center gap-x-3 py-3 text-left font-semibold text-gray-800 transition hs-accordion-active:text-blue-600 hover:text-gray-500"
        aria-controls={`hs-basic-always-open-collapse-${prefix}`}
      >
        {condition.type === "Literal" && <DocumentIcon />}
        {condition.type === "Time" && <TimeIcon />}
        {condition.type === "Composite" && <FolderIcon />}
      </button>
      <div className="ml-2 inline-flex flex-wrap gap-2 align-super">
        <div className="w-24">
          <SmallDropdown
            options={
              [
                { label: "Regular", value: "Literal" },
                { label: "Time", value: "Time" },
                { label: "Composite", value: "Composite" },
              ] satisfies {
                label: string;
                value: typeof condition.type;
              }[]
            }
            {...register(getPath("type"))}
          />
        </div>
        condition:
        {condition.type === "Literal" && (
          <>
            <div className="w-10">
              <SmallDropdown
                options={
                  [
                    { label: "≥", value: "AtLeast" },
                    { label: "≤", value: "AtMost" },
                    { label: "=", value: "Exactly" },
                  ] satisfies {
                    label: string;
                    value: typeof condition.conditionType;
                  }[]
                }
                {...register(getPath("conditionType"))}
              />
            </div>
            <Input
              className="w-12 px-1 py-1 text-center"
              placeholder="0"
              {...register(getPath("amount"), {
                setValueAs: (v: string) => (v ? parseInt(v) : 0),
              })}
            />{" "}
            of
            <div className="w-24">
              <SmallDropdown
                options={
                  [
                    { label: "Product", value: "Product" },
                    { label: "Category", value: "Category" },
                    { label: "Store", value: "Store" },
                    { label: "Price", value: "Price" },
                  ] satisfies {
                    label: string;
                    value: typeof condition.subType;
                  }[]
                }
                {...register(getPath("subType"))}
              />
            </div>
            <Input
              className="w-40 px-1 py-1 text-center"
              {...register(getPath("searchFor"))}
            />
          </>
        )}
        {condition.type === "Composite" && (
          <div className="w-24">
            <SmallDropdown
              options={
                [
                  { label: "AND &", value: "And" },
                  { label: "OR |", value: "Or" },
                  { label: "XOR ⊕", value: "Xor" },
                  { label: "IMPLIES ⇒", value: "Implies" },
                ] satisfies { label: string; value: typeof condition.subType }[]
              }
              {...register(getPath("subType"))}
            />
          </div>
        )}
        {condition.type === "Time" && (
          <>
            <div className="w-24">
              <SmallDropdown
                options={
                  [
                    { label: "Before", value: "Before" },
                    { label: "At", value: "At" },
                    { label: "After", value: "After" },
                  ] satisfies {
                    label: string;
                    value: typeof condition.conditionType;
                  }[]
                }
                {...register(getPath("conditionType"))}
              />
            </div>
            day
            <Input
              className="w-8 px-1 py-1 text-center"
              {...register(getPath("day"), {
                setValueAs: (v: string) => (v ? parseInt(v) : undefined),
              })}
            />
            month
            <Input
              className="w-8 px-1 py-1 text-center"
              {...register(getPath("month"), {
                setValueAs: (v: string) => (v ? parseInt(v) : undefined),
              })}
            />
            year
            <Input
              className="w-12 px-1 py-1 text-center"
              {...register(getPath("year"), {
                setValueAs: (v: string) => (v ? parseInt(v) : undefined),
              })}
            />
            hour
            <Input
              className="w-8 px-1 py-1 text-center"
              {...register(getPath("hour"), {
                setValueAs: (v: string) => (v ? parseInt(v) : undefined),
              })}
            />
            (optionals)
          </>
        )}
      </div>
      {id && (
        <>
          {isMyStore && (
            <>
              <button
                className="ml-2 inline" //peer-hover:opacity-100 hover:opacity-100 sm:opacity-0"
                data-hs-overlay={`#hs-modal-${prefix}`}
              >
                <RemoveIcon />
              </button>
              <button onClick={() => void handleSave()}>
                <SaveIcon />
              </button>
            </>
          )}
          <Modal
            id={`hs-modal-${prefix}`}
            title="Confirm deletion"
            content={`Are you sure you want to remove this constraint?`}
            footer={
              <Button
                onClick={() =>
                  removeConstraint({
                    storeId: storeId as string,
                    constraintId: id,
                  })
                }
                data-hs-overlay={`#hs-modal-${prefix}`}
              >
                Apply changes
              </Button>
            }
          />
        </>
      )}
      <div
        id={`hs-basic-always-open-collapse-${prefix}`}
        className="hs-accordion-content w-full overflow-hidden pl-6 transition-[height] duration-300"
        aria-labelledby={`hs-basic-always-open-heading-${prefix}`}
      >
        {condition.type === "Composite" && (
          <>
            <Condition
              prefix={`${getPath("left")}.`}
              condition={condition.left}
            />
            <Condition
              prefix={`${getPath("right")}.`}
              condition={condition.right}
            />
          </>
        )}
      </div>
    </div>
  );
}
