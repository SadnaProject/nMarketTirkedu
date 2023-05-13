import React from "react";
import useFriendsFormField from "./useFriendsFormField";
import {
  ChartDocumentIcon,
  PlusDocumentIcon,
  RemoveIcon,
  TextDocumentIcon,
} from "components/icons";
import { Modal } from "components/modal";
import { SmallDropdown } from "components/dropdown";
import Input from "components/input";
import Button from "components/button";

interface Props {
  prefix?: string;
}

export default function FriendsFormField({ prefix = "" }: Props) {
  const { fields, register, addNewFriend, removeFriend, nameInputPath } =
    useFriendsFormField(prefix);

  return (
    <div>
      <div>
        <input {...register(nameInputPath)} placeholder="Name" />
        <button type="button" onClick={addNewFriend}>
          + Add friend
        </button>
      </div>
      {fields.map((field, index) => (
        <div key={field.id}>
          <button type="button" onClick={removeFriend(index)}>
            -
          </button>
          <FriendsFormField prefix={`${prefix}friends.${index}.`} />
        </div>
      ))}
    </div>
  );
}

// export function Discount({ prefix = "" }: Props) {
//   const { fields, register, addNewFriend, removeFriend, nameInputPath } =
//     useDiscountFormField(prefix);

//   return (
//     <>
//       <div>
//         <div>
//           <input {...register(nameInputPath)} placeholder="Name" />
//           <button type="button" onClick={addNewFriend}>
//             + Add friend
//           </button>
//         </div>
//         {fields.map((field, index) => (
//           <div key={field.id}>
//             <button type="button" onClick={removeFriend(index)}>
//               -
//             </button>
//             <FriendsFormField prefix={`${prefix}friends.${index}.`} />
//           </div>
//         ))}
//       </div>
//       <div
//         className="hs-accordion active"
//         id={`hs-basic-always-open-heading-${prefix}`}
//       >
//         <button
//           className="hs-accordion-toggle peer inline-flex items-center gap-x-3 py-3 text-left font-semibold text-gray-800 transition hs-accordion-active:text-blue-600 hover:text-gray-500"
//           aria-controls={`hs-basic-always-open-collapse-${prefix}`}
//         >
//           {discount.type === "Simple" && <TextDocumentIcon />}
//           {discount.type === "Add" && (
//             <>
//               <PlusDocumentIcon />
//               Add discount out of:
//             </>
//           )}
//           {discount.type === "Max" && (
//             <>
//               <ChartDocumentIcon /> Max discount out of:
//             </>
//           )}
//         </button>
//         <div className="ml-2 inline-flex flex-wrap gap-2 align-super">
//           {discount.type === "Simple" && (
//             <>
//               <Input
//                 className="w-12 px-1 py-1 text-center"
//                 placeholder="0"
//                 defaultValue={discount.discount}
//                 onClick={(e) => {
//                   discount.discount = z.number().parse(e.currentTarget.value);
//                 }}
//               />
//               % discount on
//               <div className="w-20">
//                 <SmallDropdown options={["Product", "Category", "Store"]} />
//               </div>
//               <Input className="w-40 px-1 py-1" />
//               if:
//             </>
//           )}
//         </div>
//         <button
//           className="ml-2 inline peer-hover:opacity-100 hover:opacity-100 sm:opacity-0"
//           data-hs-overlay={`#hs-modal-${prefix}`}
//         >
//           <RemoveIcon />
//         </button>
//         <Modal
//           id={`hs-modal-${id}`}
//           title="Confirm deletion"
//           content={`Are you sure you want to remove this discount?`}
//           footer={
//             <Button
//               onClick={() => toast.success("")}
//               data-hs-overlay={`#hs-modal-${prefix}`}
//             >
//               Apply changes
//             </Button>
//           }
//         />
//         <div
//           id={`hs-basic-always-open-collapse-${prefix}`}
//           className="hs-accordion-content w-full overflow-hidden pl-6 transition-[height] duration-300"
//           aria-labelledby={`hs-basic-always-open-heading-${prefix}`}
//         >
//           {discount.type === "Simple" && (
//             <>
//               <Condition condition={discount.condition} id={id + 1} />
//             </>
//           )}
//           {(discount.type === "Add" || discount.type === "Max") && (
//             <>
//               <Discount prefix={`${prefix}left.`} />
//               <Discount prefix={`${prefix}right.`} />
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }
