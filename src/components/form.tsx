import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  type UseFormRegister,
  type FieldErrors,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { twMerge } from "tailwind-merge";
import Input from "./input";

type FormInputProps<T extends FieldValues> = {
  field: Path<T> & string & keyof T;
  label: string;
  type: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
};

export function FormInput<T extends FieldValues>({
  field,
  label,
  type,
  register,
  errors,
}: FormInputProps<T>) {
  return (
    <div>
      <label htmlFor={`${field}-input`} className="mb-2 block text-sm">
        {label}
      </label>
      <div className="relative">
        <Input
          {...register(field)}
          id={`${field}-input`}
          type={type}
          aria-describedby={`${field}-error`}
        />
        <InputErrorIcon isShown={!!errors[field]} />
      </div>
      <InputErrorMessage
        id={`${field}-error`}
        isShown={!!errors[field]}
        message={errors[field]?.message?.toString() || ""}
      />
    </div>
  );
}

type InputErrorIconProps = {
  isShown: boolean;
};

export function InputErrorIcon({ isShown }: InputErrorIconProps) {
  return (
    <div
      className={twMerge(
        "pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center pr-3 transition-all",
        isShown ? "opacity-100" : "opacity-0"
      )}
    >
      <svg
        className="h-5 w-5 text-red-500"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
      </svg>
    </div>
  );
}

type InputErrorMessageProps = {
  isShown: boolean;
  message: string;
  id: string;
};

export function InputErrorMessage({
  isShown,
  message,
  id,
}: InputErrorMessageProps) {
  const [animationParent] = useAutoAnimate();

  return (
    <p
      ref={animationParent}
      className={twMerge("mt-2 text-xs text-red-600", !isShown && "invisible")}
      id={id}
    >
      {message}
    </p>
  );
}
