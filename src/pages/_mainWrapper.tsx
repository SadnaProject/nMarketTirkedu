import { useCheckRedirect } from "utils/paths";
import { useEnforceSession } from "./_enforceSession";

type Props = {
  children: React.ReactNode;
};

export function MainWrapper({ children }: Props) {
  useEnforceSession();
  // useCheckRedirect();

  return <>{children}</>;
}
