import Gallery from "components/gallery";
import Layout from "./_layout";
import Link from "next/link";
import Card from "components/card";
import PATHS, { useGuestRedirect } from "utils/paths";
import { CourtHammerIcon, ThumbDownIcon, ThumbUpIcon } from "components/icons";
import { api } from "server/communication/api";
import { cachedQueryOptions } from "utils/query";
import { type BidDTO } from "server/domain/Users/Bid";
import Button from "components/button";
import Price from "components/price";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/input";
import { onBidChangeEvent } from "utils/events";
import { useEffect } from "react";
import Badge, { GreenBadge, RedBadge } from "components/Badge";

export default function Home() {
  useGuestRedirect();

  const { data: bidsToMe, refetch: refetchGetBidsToMe } =
    api.users.getBidsToMe.useQuery(undefined, cachedQueryOptions);

  useEffect(() => {
    const refetchGetBidsToMeCallback = () => {
      void refetchGetBidsToMe();
    };
    document.addEventListener(onBidChangeEvent, refetchGetBidsToMeCallback);
    return () => {
      document.removeEventListener(
        onBidChangeEvent,
        refetchGetBidsToMeCallback
      );
    };
  }, [refetchGetBidsToMe]);

  return (
    <Layout>
      <h1>Bids</h1>
      <Gallery
        list={
          bidsToMe?.sort((a, b) =>
            a.state === "WAITING" ? -1 : a.state === "APPROVED" ? 0 : 1
          ) ?? []
        }
        getId={(bid) => bid.id}
        getItem={(bid) => <BidCard bid={bid} />}
        className="grid-cols-1 lg:grid-cols-3"
      />
    </Layout>
  );
}

type BidCardProps = {
  bid: BidDTO;
};

const bidSchema = z.object({
  price: z.number().nonnegative(),
});
type bidFormValues = z.infer<typeof bidSchema>;

function BidCard({ bid }: BidCardProps) {
  const bidForm = useForm<bidFormValues>({
    resolver: zodResolver(bidSchema),
    defaultValues: { price: 0 },
  });
  const { mutate: approveBid } = api.users.approveBid.useMutation({
    ...cachedQueryOptions,
    onSettled: () => {
      document.dispatchEvent(new Event(onBidChangeEvent));
    },
    onSuccess: () => {
      toast.success("Bid approved");
    },
  });
  const { mutate: rejectBid } = api.users.rejectBid.useMutation({
    ...cachedQueryOptions,
    onSettled: () => {
      document.dispatchEvent(new Event(onBidChangeEvent));
    },
    onSuccess: () => {
      toast.success("Bid rejected");
    },
  });
  const { mutate: counterBid } = api.users.counterBid.useMutation({
    ...cachedQueryOptions,
    onSettled: () => {
      document.dispatchEvent(new Event(onBidChangeEvent));
    },
    onSuccess: () => {
      toast.success("Counter bid sent");
    },
  });

  const handleCounterBid = bidForm.handleSubmit(
    (data) => {
      counterBid({
        bidId: bid.id,
        price: data.price,
      });
    },
    (e) => {
      toast.error(Object.values(e)[0]?.message || "Something went wrong");
    }
  );

  return (
    <Card className="mt-0 h-full">
      <h3 className="text-lg font-bold text-slate-800">{bid.productName}</h3>
      <Price price={bid.price} />
      {bid.state === "APPROVED" && (
        <GreenBadge>
          <ThumbUpIcon /> Approved
        </GreenBadge>
      )}
      {bid.state === "REJECTED" && (
        <RedBadge>
          <ThumbDownIcon />
          Rejected
        </RedBadge>
      )}
      {bid.state === "WAITING" && (
        <>
          <div className="flex items-center justify-center gap-3">
            <Button
              className="mt-2 bg-green-800"
              onClick={() => approveBid({ bidId: bid.id })}
            >
              <ThumbUpIcon />
              Approve
            </Button>
            <Button
              className="mt-2 bg-red-800"
              onClick={() => rejectBid({ bidId: bid.id })}
            >
              <ThumbDownIcon />
              Reject
            </Button>
          </div>
          <br />
          {bid.type === "Store" && (
            <div className="flex items-center justify-center gap-3">
              <Input
                className="max-w-[5rem] text-center"
                {...bidForm.register("price", {
                  setValueAs: (v: string) => (v ? parseInt(v) : 0),
                })}
              />
              <Button
                className="mt-2"
                disabled={bidForm.formState.isSubmitting}
                onClick={() => void handleCounterBid()}
              >
                <CourtHammerIcon />
                Counter
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
