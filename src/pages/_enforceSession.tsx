import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect } from "react";
import { api } from "utils/api";

export function EnforceSession() {
  const { status } = useSession();
  const { mutateAsync: startSession } = api.auth.startSession.useMutation();

  const handleUnauthenticated = useCallback(async () => {
    const userId = await startSession();
    await signIn("anonymous", { id: userId });
  }, [startSession]);

  useEffect(() => {
    if (status === "unauthenticated") {
      void handleUnauthenticated();
    }
  }, [status, handleUnauthenticated]);

  return <></>;
}
