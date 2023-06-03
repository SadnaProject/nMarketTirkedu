import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect } from "react";
import { api } from "server/communication/api";

export function useEnforceSession() {
  const { status } = useSession();
  const { mutateAsync: startSession } = api.auth.startSession.useMutation();
  api.users.onLoginEvent.useSubscription(undefined, {
    onData: () => console.log("onLoginEvent"),
  });

  const handleUnauthenticated = useCallback(async () => {
    const userId = await startSession();
    await signIn("anonymous", { id: userId });
  }, [startSession]);

  useEffect(() => {
    if (status === "unauthenticated") {
      void handleUnauthenticated();
    }
  }, [status, handleUnauthenticated]);
}
