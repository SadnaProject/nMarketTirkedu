import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect } from "react";
import { api } from "server/communication/api";
import { cachedQueryOptions } from "utils/query";

export function useEnforceSession() {
  const { status } = useSession();
  const { mutate: startSession } = api.auth.startSession.useMutation({
    ...cachedQueryOptions,
    onSuccess: (userId) => signIn("anonymous", { id: userId }),
  });
  api.users.onLoginEvent.useSubscription(undefined, {
    onData: () => console.log("onLoginEvent"),
    onError: (e) => console.log("onLoginEvent error", e),
    enabled: status === "authenticated",
  });

  const handleUnauthenticated = useCallback(() => {
    startSession();
  }, [startSession]);

  useEffect(() => {
    if (status === "unauthenticated") {
      void handleUnauthenticated();
    }
  }, [status, handleUnauthenticated]);
}
