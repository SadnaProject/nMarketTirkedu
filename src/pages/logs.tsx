import { useGuestRedirect } from "utils/paths";
import Layout from "./_layout";
import { api } from "server/communication/api";
import { cachedQueryOptions } from "utils/query";
import { RemoveIcon, TimeIcon } from "components/icons";
import { Modal } from "components/modal";
import Button from "components/button";
import Badge, { GreenBadge, RedBadge } from "components/Badge";

export default function Home() {
  useGuestRedirect();
  const { data: errors } = api.auth.getErrors.useQuery(
    undefined,
    cachedQueryOptions
  );
  const { data: logs } = api.auth.getLogs.useQuery(
    undefined,
    cachedQueryOptions
  );

  return (
    <Layout>
      <h1>Unexpected Errors</h1>
      {errors?.length === 0 && <p>No errors 😎</p>}
      {errors
        ?.slice()
        .reverse()
        .map((error, i) => (
          <div key={`error-${i}`} className="flex gap-2">
            <Badge>{error.time.toLocaleString()}</Badge>
            <GreenBadge>{error.name}</GreenBadge>
            {error.args.map((arg, j) => (
              <Badge key={`error-${i}-param-${j}`}>{JSON.stringify(arg)}</Badge>
            ))}
            <RedBadge>{error.error}</RedBadge>
          </div>
        ))}
      <h1>Logs</h1>
      {logs
        ?.slice()
        .reverse()
        .map((log, i) => (
          <div key={`log-${i}`} className="flex gap-2">
            <Badge>{log.time.toLocaleString()}</Badge>
            <GreenBadge>{log.name}</GreenBadge>
            {log.args.map((arg, j) => (
              <Badge key={`log-${i}-param-${j}`}>{JSON.stringify(arg)}</Badge>
            ))}
            <RedBadge>{log.error}</RedBadge>
          </div>
        ))}
    </Layout>
  );
}
