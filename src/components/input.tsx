import { type ForwardedRef, forwardRef } from "react";
import { type FieldErrors, type FieldValues } from "react-hook-form";
import { twMerge } from "tailwind-merge";

type Props<T extends FieldValues> = {
  error?: FieldErrors<T>;
} & React.ComponentProps<"input">;

export default forwardRef(function Input<T extends FieldValues>(
  { error, ...props }: Props<T>,
  ref: ForwardedRef<HTMLInputElement>
) {
  return (
    <input
      type="text"
      ref={ref}
      {...props}
      className={twMerge(
        "relative -ml-px block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 sm:mt-0 sm:first:ml-0",
        error && "border-red-500",
        props.className
      )}
    />
  );
});

// export const SmallInput = forwardRef(function SmallInput(
//   { ...props }: Props,
//   ref: ForwardedRef<HTMLInputElement>
// ) {
//   return (
//     <div className="input-sizer text-base">
//       <input
//         type="text"
//         onInput={(e) => {
//           const target = e.target as HTMLInputElement;
//           const parent = target.parentNode as HTMLDivElement;
//           parent.setAttribute("data-value", target.value);
//         }}
//         size={4}
//         ref={ref}
//         {...props}
//         className={twMerge(
//           "relative -ml-px block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 sm:mt-0 sm:first:ml-0",
//           props.className
//         )}
//       />
//     </div>
//   );
// });
