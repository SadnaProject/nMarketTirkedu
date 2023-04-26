import Glow from "components/glow";
import PATHS from "utils/paths";

export default function Home() {
  return (
    <>
      <div className="mt-7 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-4 sm:p-7">
          <div className="text-center">
            <h1 className="block text-2xl font-bold text-gray-800">Sign up</h1>
            <p className="mt-2 flex flex-wrap justify-center gap-x-1 text-sm text-gray-600">
              <span>Already have an account? </span>
              <a
                className="font-medium text-blue-600 decoration-2 hover:underline"
                href={PATHS.login.path}
              >
                Sign in here
              </a>
            </p>
          </div>

          <div className="mt-5">
            <form>
              <div className="grid gap-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="block w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                      aria-describedby="email-error"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex hidden items-center pr-3">
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
                  </div>
                  <p
                    className="mt-2 hidden text-xs text-red-600"
                    id="email-error"
                  >
                    Please include a valid email address so we can get back to
                    you
                  </p>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="block w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                      aria-describedby="password-error"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex hidden items-center pr-3">
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
                  </div>
                  <p
                    className="mt-2 hidden text-xs text-red-600"
                    id="password-error"
                  >
                    8+ characters required
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="confirm-password"
                      name="confirm-password"
                      className="block w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                      aria-describedby="confirm-password-error"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex hidden items-center pr-3">
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
                  </div>
                  <p
                    className="mt-2 hidden text-xs text-red-600"
                    id="confirm-password-error"
                  >
                    Password does not match the password
                  </p>
                </div>

                <div className="flex items-center">
                  <div className="flex">
                    <input
                      id="agree-terms"
                      name="agree-terms"
                      type="checkbox"
                      className="mt-0.5 shrink-0 rounded border-gray-200 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 sm:ml-2">
                    <label
                      htmlFor="agree-terms"
                      className="flex flex-wrap gap-x-1 text-sm"
                    >
                      <span>I accept the</span>
                      <a
                        className="font-medium text-blue-600 decoration-2 hover:underline"
                        href="#"
                      >
                        Terms and Conditions
                      </a>
                    </label>
                  </div>
                </div>
                <Glow className="peer-hover:blur-md">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-primary px-4 py-3 text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Sign up
                  </button>
                </Glow>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
