import { useState } from "react";

type Props = {
  label?: string;
  options: string[];
};

export function CategoryDropdown({ label, options }: Props) {
  const [value, setValue] = useState<string | undefined>(label || options[0]);

  return (
    <div className="hs-dropdown relative z-10 -ml-px -mt-px block w-full border-gray-200 bg-white text-sm shadow-sm first:rounded-t-lg last:rounded-b-lg focus:z-10 focus:border-blue-500 focus:ring-blue-500 sm:mt-0 sm:w-60 sm:first:ml-0 sm:first:rounded-l-lg sm:first:rounded-tr-none sm:last:rounded-r-lg sm:last:rounded-bl-none">
      <button
        id="hs-dropdown-with-dividers"
        type="button"
        className="hs-dropdown-toggle relative inline-flex w-full items-center justify-center gap-2 rounded-t-lg border border-gray-300 bg-white px-4 py-3 align-middle text-sm font-medium text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white hover:bg-slate-50 sm:rounded-l-lg sm:rounded-tr-none"
      >
        {value || label}
        <DropdownSvg />
      </button>
      <div
        className="hs-dropdown-menu duration z-50 mt-2 hidden max-h-80 min-w-[15rem] divide-y divide-gray-200 overflow-auto rounded-lg bg-white p-2 py-2 opacity-0 shadow-md transition-[opacity,margin] scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-blue-300 first:pt-0 hs-dropdown-open:opacity-100"
        aria-labelledby="hs-dropdown-with-dividers"
      >
        {options.map((option) => (
          <div
            key={option}
            className="flex items-center gap-x-3.5 rounded-md px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 hover:bg-slate-100"
            onClick={() => setValue(option)}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
}

function DropdownSvg() {
  return (
    <svg
      className="h-2.5 w-2.5 text-slate-600 hs-dropdown-open:rotate-180"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 5L8.16086 10.6869C8.35239 10.8637 8.64761 10.8637 8.83914 10.6869L15 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
