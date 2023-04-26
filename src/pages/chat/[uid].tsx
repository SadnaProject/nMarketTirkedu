import { useRouter } from "next/router";
import Balancer from "react-wrap-balancer";

export default function Home() {
  const router = useRouter();
  const { uid } = router.query;
  console.log(uid);

  return (
    <div className="flex h-full flex-col items-center justify-between overflow-auto">
      <div className="flex h-full w-full justify-center overflow-auto scrollbar-track-gray-100 scrollbar-thumb-blue-300 sm:scrollbar-thin">
        <div className="flex h-full w-full max-w-xl flex-col gap-3 p-4">
          <div className="tooltip-left me-8 w-fit max-w-lg rounded-md bg-white p-3">
            hi, how r u
          </div>
          <div className="right-0 ms-8 w-fit max-w-lg self-end rounded-md bg-white p-3">
            fine!
          </div>
          {Array.from({ length: 11 }).map((_, i) => (
            <div
              key={i}
              className="right-0 ms-8 w-fit max-w-lg self-end rounded-md bg-white p-3"
            >
              <Balancer>
                what about u? how was your test? did u pass? cause i have heard
                it was a hard one...
              </Balancer>
            </div>
          ))}
        </div>
      </div>
      <div className="relative flex w-full max-w-lg gap-1 p-3">
        <input
          type="text"
          placeholder="Enter message"
          className="-ml-px -mt-px block w-full rounded-full border-e-2 border-s-2 border-gray-200 px-4 py-3 pr-11 text-sm shadow-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 sm:mt-0 sm:first:ml-0"
        />
        <button
          type="button"
          className="inline-flex h-[2.875rem] w-[2.875rem] flex-shrink-0 items-center justify-center gap-2 rounded-full border border-transparent bg-blue-500 text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-600"
        >
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
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
