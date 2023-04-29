type CollapseProps = {
  id: string;
  openLabel?: string;
  closeLabel?: string;
  children?: React.ReactNode;
};

export default function Collapse({
  id,
  children,
  openLabel = "Read more",
  closeLabel = "Read less",
}: CollapseProps) {
  return (
    <div className="my-2">
      <a
        className="hs-collapse-toggle inline-flex cursor-pointer items-center gap-x-2 text-primary"
        id={id}
        data-hs-collapse={`#${id}-heading`}
      >
        <span className="hs-collapse-open:hidden">{openLabel}</span>
        <span className="hidden hs-collapse-open:block">{closeLabel}</span>
        <svg
          className="h-2.5 w-2.5 hs-collapse-open:rotate-180"
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
      </a>
      <p
        id={`${id}-heading`}
        className="hs-collapse hidden w-full overflow-hidden text-gray-600 transition-[height] duration-300 dark:text-gray-400"
        aria-labelledby={id}
      >
        {children}
      </p>
    </div>
  );
}
