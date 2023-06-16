import Layout from "../../_layout";
import { useRouter } from "next/router";
import StoreNavbar from "components/storeNavbar";
import Button from "components/button";
import { SmallDropdown } from "components/dropdown";
import { toast } from "react-hot-toast";
import { Modal } from "components/modal";
import { api } from "server/communication/api";
import { cachedQueryOptions } from "utils/query";
import PATHS, { useGuestRedirect } from "utils/paths";
import {
  ChartDocumentIcon,
  CreateIcon,
  DocumentIcon,
  FolderIcon,
  PlusDocumentIcon,
  RemoveIcon,
  SaveIcon,
  TextDocumentIcon,
  TimeIcon,
} from "components/icons";
import {
  discountArgsSchema,
  type DiscountArgs,
} from "server/domain/Stores/DiscountPolicy/Discount";
import { type ConditionArgs } from "server/domain/Stores/Conditions/CompositeLogicalCondition/Condition";
import Input from "components/input";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { onDiscountChangeEvent, onDiscountSaveEvent } from "utils/events";

const defaultCondition: ConditionArgs = {
  type: "Literal",
  amount: 0,
  conditionType: "Exactly",
  subType: "Product",
  searchFor: "",
};

const defaultDiscount: DiscountArgs = {
  type: "Simple",
  amount: 0,
  discountOn: "product",
  searchFor: "",
  condition: defaultCondition,
};

export default function Home() {
  useGuestRedirect();
  const router = useRouter();
  const { storeId } = router.query;
  const { mutate: addDiscount } = api.stores.addDiscountToStore.useMutation({
    ...cachedQueryOptions,
    onSuccess: (discountId) => {
      document.dispatchEvent(new Event(onDiscountChangeEvent));
      toast.success("Discount added successfully");
      // void router.push(PATHS.storeDiscount.path(storeId as string, discountId));
    },
  });
  const { data: discounts, refetch: refetchDiscounts } =
    api.stores.getStoreDiscounts.useQuery(
      { storeId: storeId as string },
      { ...cachedQueryOptions, enabled: !!storeId }
    );

  useEffect(() => {
    const refetchDiscountsCallback = () => {
      void refetchDiscounts();
    };
    document.addEventListener(onDiscountChangeEvent, refetchDiscountsCallback);
    return () => {
      document.removeEventListener(
        onDiscountChangeEvent,
        refetchDiscountsCallback
      );
    };
  }, [refetchDiscounts]);

  return (
    <Layout className="max-w-none">
      <StoreNavbar storeId={storeId as string} />
      <div
        className="hs-accordion-group flex w-full flex-col overflow-auto"
        data-hs-accordion-always-open
      >
        <h2>Ordered by chronological update date:</h2>
        {discounts &&
          Object.entries(Object.fromEntries(discounts)).map(
            ([discountId, discount], i) => (
              <FullDiscount
                key={`discount-${Math.random()}`}
                discount={discount}
                id={discountId}
              />
            )
          )}
      </div>
      <Button
        className="rounded-full"
        onClick={() =>
          addDiscount({
            storeId: storeId as string,
            discount: defaultDiscount,
          })
        }
      >
        <CreateIcon />
        Create
      </Button>
    </Layout>
  );
}

type FullDiscountProps = {
  discount: DiscountArgs;
  id: string;
};

function FullDiscount({ discount, id }: FullDiscountProps) {
  const router = useRouter();
  const { storeId } = router.query;
  const formMethods = useForm<DiscountArgs>({
    resolver: zodResolver(discountArgsSchema),
    defaultValues: discount,
    mode: "all",
    criteriaMode: "all",
    reValidateMode: "onChange",
  });

  // useEffect(() => {
  //   const handleSaveCallback = () => void handleSave();
  //   document.addEventListener(onDiscountSaveEvent, handleSaveCallback);
  //   return () => {
  //     document.removeEventListener(onDiscountSaveEvent, handleSaveCallback);
  //   };
  // }, [handleSave]);

  return (
    <FormProvider {...formMethods}>
      <Discount discount={formMethods.getValues()} id={id} />
    </FormProvider>
  );
}

type DiscountProps = {
  prefix?: string;
  discount: DiscountArgs;
  id?: string;
};

export function Discount({
  id,
  discount = defaultDiscount,
  prefix = "",
}: DiscountProps) {
  const router = useRouter();
  const { storeId } = router.query;
  const {
    register,
    formState: { errors }, //! DON'T DELETE THIS LINE. IT MAKES THE UI UPDATE
    handleSubmit,
  } = useFormContext<DiscountArgs>();
  const { mutate: removeDiscount } =
    api.stores.removeDiscountFromStore.useMutation({
      ...cachedQueryOptions,
      onSuccess: () => {
        document.dispatchEvent(new Event(onDiscountChangeEvent));
        toast.success("Change to discount was made successfully");
      },
    });
  const { mutate: addDiscount } = api.stores.addDiscountToStore.useMutation({
    ...cachedQueryOptions,
    onSuccess: () => {
      if (!id) return;
      removeDiscount({ storeId: storeId as string, discountId: id });
    },
  });

  const getPath = useCallback(
    <T extends string>(field: T) => `${prefix}${field}` as T,
    [prefix]
  );

  const handleSave = handleSubmit(
    (data) => {
      console.log(data);
      addDiscount({
        storeId: storeId as string,
        discount: data,
      });
    },
    () => {
      toast.error("Discount is invalid");
      // console.log(getValues());
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
        {discount.type === "Simple" && <TextDocumentIcon />}
        {discount.type === "Add" && <PlusDocumentIcon />}
        {discount.type === "Max" && <ChartDocumentIcon />}
      </button>
      <div className="ml-2 inline-flex flex-wrap gap-2 align-super">
        <div className="w-20">
          <SmallDropdown
            options={
              [
                { label: "Simple", value: "Simple" },
                { label: "Add", value: "Add" },
                { label: "Max", value: "Max" },
              ] satisfies {
                label: string;
                value: typeof discount.type;
              }[]
            }
            {...register(getPath("type"))}
          />
        </div>
        discount:
        {discount.type === "Simple" && (
          <>
            <Input
              className="w-12 px-1 py-1 text-center"
              placeholder="0"
              {...register(getPath("amount"), { valueAsNumber: true })}
            />
            % on
            <div className="w-24">
              <SmallDropdown
                options={
                  [
                    { label: "Product", value: "product" },
                    { label: "Category", value: "category" },
                    { label: "Store", value: "store" },
                  ] satisfies {
                    label: string;
                    value: typeof discount.discountOn;
                  }[]
                }
                {...register(getPath("discountOn"))}
              />
            </div>
            <Input
              className="w-40 px-1 py-1 text-center"
              {...register(getPath("searchFor"))}
            />
            if:
          </>
        )}
      </div>
      {id && (
        <>
          <button
            className="ml-2 inline" //peer-hover:opacity-100 hover:opacity-100 sm:opacity-0"
            data-hs-overlay={`#hs-modal-${prefix}`}
          >
            <RemoveIcon />
          </button>
          <button
            onClick={
              () => void handleSave()
              //document.dispatchEvent(new Event(onDiscountSaveEvent))
            }
          >
            <SaveIcon />
          </button>
          <Modal
            id={`hs-modal-${prefix}`}
            title="Confirm deletion"
            content={`Are you sure you want to remove this discount?`}
            footer={
              <Button
                onClick={() =>
                  removeDiscount({ storeId: storeId as string, discountId: id })
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
        {discount.type === "Simple" && (
          <Condition
            condition={discount.condition}
            prefix={`${getPath("condition")}.`}
          />
        )}
        {(discount.type === "Add" || discount.type === "Max") && (
          <>
            <Discount prefix={`${getPath("left")}.`} discount={discount.left} />
            <Discount
              prefix={`${getPath("right")}.`}
              discount={discount.right}
            />
          </>
        )}
      </div>
    </div>
  );
}

type ConditionProps = {
  prefix?: string;
  condition: ConditionArgs;
};

function Condition({
  condition = defaultCondition,
  prefix = "",
}: ConditionProps) {
  const {
    register,
    formState: { errors }, //! DON'T DELETE THIS LINE. IT MAKES THE UI UPDATE
  } = useFormContext<ConditionArgs>();

  const getPath = useCallback(
    <T extends string>(field: T) => `${prefix}${field}` as T,
    [prefix]
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
      {/* <button
        className="ml-2 inline peer-hover:opacity-100 hover:opacity-100 sm:opacity-0"
        data-hs-overlay={`#hs-modal-${prefix}`}
      >
        <RemoveIcon />
      </button> */}
      <Modal
        id={`hs-modal-${prefix}`}
        title="Confirm deletion"
        content={`Are you sure you want to remove this condition?`}
        footer={
          <Button
            onClick={() => toast.success("")}
            data-hs-overlay={`#hs-modal-${prefix}`}
          >
            Apply changes
          </Button>
        }
      />
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
