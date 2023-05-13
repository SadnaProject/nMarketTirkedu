import Layout from "../../_layout";
import { useRouter } from "next/router";
import { z } from "zod";
import StoreNavbar from "components/storeNavbar";
import Button from "components/button";
import { SmallDropdown } from "components/dropdown";
import { toast } from "react-hot-toast";
import { Modal } from "components/modal";
import { api } from "utils/api";
import { onError } from "utils/query";
import { useGuestRedirect } from "utils/paths";
import {
  ChartDocumentIcon,
  DocumentIcon,
  FolderIcon,
  PlusDocumentIcon,
  RemoveIcon,
  TextDocumentIcon,
  TimeIcon,
} from "components/icons";
import {
  discountArgsSchema,
  type DiscountArgs,
} from "server/domain/Stores/DiscountPolicy/Discount";
import { type ConditionArgs } from "server/domain/Stores/Conditions/CompositeLogicalCondition/Condition";
import Input from "components/input";
import {
  type FieldValues,
  type UseFormRegister,
  useForm,
  FormProvider,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FriendsFormField from "components/rec/FriendsFormField";
import { type FriendsFormValues } from "components/rec/useFriendsFormField";

const discount = {
  type: "Max",
  left: {
    type: "Simple",
    discountOn: "product",
    searchFor: "Banana",
    discount: 15,
    condition: {
      type: "Composite",
      subType: "And",
      left: {
        type: "Literal",
        subType: "Product",
        searchFor: "Banana",
        conditionType: "AtLeast",
        amount: 1,
      },
      right: {
        type: "Literal",
        subType: "Category",
        searchFor: "Food",
        conditionType: "AtLeast",
        amount: 5,
      },
    },
  },
  right: {
    type: "Simple",
    discountOn: "product",
    searchFor: "Banana",
    discount: 15,
    condition: {
      type: "Composite",
      subType: "And",
      left: {
        type: "Literal",
        subType: "Product",
        searchFor: "Banana",
        conditionType: "AtLeast",
        amount: 1,
      },
      right: {
        type: "Literal",
        subType: "Category",
        searchFor: "Food",
        conditionType: "AtLeast",
        amount: 5,
      },
    },
  },
} as const satisfies DiscountArgs;

export default function Home() {
  useGuestRedirect();
  const router = useRouter();
  const storeId = z.undefined().or(z.string()).parse(router.query.storeId);
  const { mutate: makeStoreOwner } = api.stores.makeStoreOwner.useMutation({
    onError,
    onSuccess: () => {
      toast.success("Job added successfully");
    },
  });
  const { mutate: makeStoreManager } = api.stores.makeStoreManager.useMutation({
    onError,
    onSuccess: () => {
      toast.success("Job added successfully");
    },
  });
  const formMethods = useForm<DiscountArgs>({
    resolver: zodResolver(discountArgsSchema),
    defaultValues: discount,
  });
  const methods = useForm<FriendsFormValues>({
    defaultValues: { name: "hi", friends: [{ name: "bye" }] },
  });

  return (
    <Layout>
      <h1>The Happy Place</h1>
      {storeId && <StoreNavbar storeId={storeId} />}

      {/* <div className="flex flex-wrap sm:flex-nowrap">
        <CategoryDropdown options={["Manager", "Owner"]} />
        <Input placeholder="Email" className="rounded-none" />
        <Button
          glowClassName="w-full"
          glowContainerClassName="w-full sm:w-auto"
          className="h-full w-full rounded-t-lg sm:rounded-lg sm:rounded-l-none"
          // onClick={()=>}
        >
          Add
        </Button>
      </div> */}
      <FormProvider {...methods}>
        <form className="grid gap-y-4">
          <FriendsFormField />
        </form>
      </FormProvider>
      <Button onClick={() => console.log(methods.getValues())}>Log</Button>

      <div className="hs-accordion-group w-full" data-hs-accordion-always-open>
        <Discount discount={discount} id={0} />
      </div>
    </Layout>
  );
}

type DiscountProps = {
  id: number;
  discount: DiscountArgs;
};

function Discount({ id, discount }: DiscountProps) {
  return (
    <div
      className="hs-accordion active"
      id={`hs-basic-always-open-heading-${id}`}
    >
      <button
        className="hs-accordion-toggle peer inline-flex items-center gap-x-3 py-3 text-left font-semibold text-gray-800 transition hs-accordion-active:text-blue-600 hover:text-gray-500"
        aria-controls={`hs-basic-always-open-collapse-${id}`}
      >
        {discount.type === "Simple" && <TextDocumentIcon />}
        {discount.type === "Add" && (
          <>
            <PlusDocumentIcon />
            Add discount out of:
          </>
        )}
        {discount.type === "Max" && (
          <>
            <ChartDocumentIcon /> Max discount out of:
          </>
        )}
      </button>
      <div className="ml-2 inline-flex flex-wrap gap-2 align-super">
        {discount.type === "Simple" && (
          <>
            <Input
              className="w-12 px-1 py-1 text-center"
              placeholder="0"
              defaultValue={discount.discount}
              onClick={(e) => {
                discount.discount = z.number().parse(e.currentTarget.value);
              }}
            />
            % discount on
            <div className="w-20">
              <SmallDropdown options={["Product", "Category", "Store"]} />
            </div>
            <Input className="w-40 px-1 py-1" />
            if:
          </>
        )}
      </div>
      <button
        className="ml-2 inline peer-hover:opacity-100 hover:opacity-100 sm:opacity-0"
        data-hs-overlay={`#hs-modal-${id}`}
      >
        <RemoveIcon />
      </button>
      <Modal
        id={`hs-modal-${id}`}
        title="Confirm deletion"
        content={`Are you sure you want to remove this discount?`}
        footer={
          <Button
            onClick={() => toast.success("")}
            data-hs-overlay={`#hs-modal-${id}`}
          >
            Apply changes
          </Button>
        }
      />
      <div
        id={`hs-basic-always-open-collapse-${id}`}
        className="hs-accordion-content w-full overflow-hidden pl-6 transition-[height] duration-300"
        aria-labelledby={`hs-basic-always-open-heading-${id}`}
      >
        {discount.type === "Simple" && (
          <>
            <Condition condition={discount.condition} id={id + 1} />
          </>
        )}
        {(discount.type === "Add" || discount.type === "Max") && (
          <>
            <Discount discount={discount.left} id={id + 1} />
            <Discount discount={discount.right} id={id + 2} />
          </>
        )}
      </div>
    </div>
  );
}

type ConditionProps = {
  id: number;
  condition: ConditionArgs;
};

function Condition({ id, condition }: ConditionProps) {
  return (
    <div
      className="hs-accordion active"
      id={`hs-basic-always-open-heading-${id}`}
    >
      <button
        className="hs-accordion-toggle peer inline-flex items-center gap-x-3 py-3 text-left font-semibold text-gray-800 transition hs-accordion-active:text-blue-600 hover:text-gray-500"
        aria-controls={`hs-basic-always-open-collapse-${id}`}
      >
        {condition.type === "Literal" && <DocumentIcon />}
        {condition.type === "Time" && <TimeIcon />}
        {condition.type === "Composite" && <FolderIcon />}
      </button>
      <div className="ml-2 inline-flex flex-wrap gap-2 align-super">
        {condition.type === "Literal" && (
          <>
            <div className="w-10">
              <SmallDropdown options={["≥", "≤", "="]} />
            </div>
            <Input className="w-12 px-1 py-1 text-center" placeholder="0" /> of
            <div className="w-20">
              <SmallDropdown
                options={["Product", "Category", "Store", "Price"]}
              />
            </div>
            <Input className="w-40 px-1 py-1" />
          </>
        )}
        {condition.type === "Composite" && (
          <div className="w-24">
            <SmallDropdown options={["AND &", "OR |", "XOR ⊕", "IMPLIES ⇒"]} />
          </div>
        )}
      </div>
      <button
        className="ml-2 inline peer-hover:opacity-100 hover:opacity-100 sm:opacity-0"
        data-hs-overlay={`#hs-modal-${id}`}
      >
        <RemoveIcon />
      </button>
      <Modal
        id={`hs-modal-${id}`}
        title="Confirm deletion"
        content={`Are you sure you want to remove this condition?`}
        footer={
          <Button
            onClick={() => toast.success("")}
            data-hs-overlay={`#hs-modal-${id}`}
          >
            Apply changes
          </Button>
        }
      />
      <div
        id={`hs-basic-always-open-collapse-${id}`}
        className="hs-accordion-content w-full overflow-hidden pl-6 transition-[height] duration-300"
        aria-labelledby={`hs-basic-always-open-heading-${id}`}
      >
        {condition.type === "Composite" && (
          <>
            <Condition condition={condition.left} id={id + 1} />
            <Condition condition={condition.right} id={id + 2} />
          </>
        )}
      </div>
    </div>
  );
}
