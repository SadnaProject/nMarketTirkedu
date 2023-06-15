import Gallery from "components/gallery";
import Layout from "../../_layout";
import Card from "components/card";
import { useGuestRedirect } from "utils/paths";
import { ThumbDownIcon, ThumbUpIcon } from "components/icons";
import { api } from "server/communication/api";
import { cachedQueryOptions } from "utils/query";
import Button from "components/button";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { onMakeOwnerRequestChangeEvent } from "utils/events";
import { useEffect } from "react";
import { GreenBadge, RedBadge } from "components/Badge";
import { type MakeOwnerDTO } from "server/domain/Stores/MakeOwner";
import StoreNavbar from "components/storeNavbar";
import { useRouter } from "next/router";

export default function Home() {
  useGuestRedirect();

  const router = useRouter();
  const storeId = z.undefined().or(z.string()).parse(router.query.storeId);
  const { data: makeOwnerRequests, refetch: refetchMakeOwnerRequests } =
    api.users.getMakeOwnerRequests.useQuery(undefined, cachedQueryOptions);

  useEffect(() => {
    const refetchMakeOwnerRequestsCallback = () => {
      void refetchMakeOwnerRequests();
    };
    document.addEventListener(
      onMakeOwnerRequestChangeEvent,
      refetchMakeOwnerRequestsCallback
    );
    return () => {
      document.removeEventListener(
        onMakeOwnerRequestChangeEvent,
        refetchMakeOwnerRequestsCallback
      );
    };
  }, [refetchMakeOwnerRequests]);

  return (
    <Layout>
      <StoreNavbar storeId={storeId as string} />
      <h1>Make Owner Requests</h1>
      <Gallery
        list={
          makeOwnerRequests?.sort((a, b) =>
            a.state === "WAITING" ? -1 : a.state === "APPROVED" ? 0 : 1
          ) ?? []
        }
        getId={(request) => request.id}
        getItem={(request) => <MakeOwnerRequestCard request={request} />}
        className="grid-cols-1 lg:grid-cols-3"
      />
    </Layout>
  );
}

type MakeOwnerRequestCardProps = {
  request: MakeOwnerDTO;
};

function MakeOwnerRequestCard({ request }: MakeOwnerRequestCardProps) {
  const { mutate: approveRequest } =
    api.users.approveMakeOwnerRequest.useMutation({
      ...cachedQueryOptions,
      onSettled: () => {
        document.dispatchEvent(new Event(onMakeOwnerRequestChangeEvent));
      },
      onSuccess: () => {
        toast.success("Request approved");
      },
    });
  const { mutate: rejectRequest } =
    api.users.rejectMakeOwnerRequest.useMutation({
      ...cachedQueryOptions,
      onSettled: () => {
        document.dispatchEvent(new Event(onMakeOwnerRequestChangeEvent));
      },
      onSuccess: () => {
        toast.success("Request rejected");
      },
    });

  return (
    <Card className="mt-0 h-full">
      <h3 className="text-lg font-bold text-slate-800">
        {request.userEmailAddress}
      </h3>
      {request.state === "APPROVED" && (
        <GreenBadge>
          <ThumbUpIcon /> Approved
        </GreenBadge>
      )}
      {request.state === "REJECTED" && (
        <RedBadge>
          <ThumbDownIcon />
          Rejected
        </RedBadge>
      )}
      {request.state === "WAITING" && (
        <>
          <div className="flex items-center justify-center gap-3">
            <Button
              className="mt-2 bg-green-800"
              onClick={() => approveRequest({ makeOwnerRequestId: request.id })}
            >
              <ThumbUpIcon />
              Approve
            </Button>
            <Button
              className="mt-2 bg-red-800"
              onClick={() => rejectRequest({ makeOwnerRequestId: request.id })}
            >
              <ThumbDownIcon />
              Reject
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
