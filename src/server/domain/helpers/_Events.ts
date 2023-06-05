export type Event =
  | {
      channel: `storePurchase_${string}`;
      type: "storePurchase";
      storeId: string;
      // more data
    }
  | {
      channel: `storeChanged_${string}`;
      type: "storeChanged";
      storeId: string;
      // more data
    }
  | {
      channel: `bidAdded_${string}`;
      type: "bidAdded";
      bidId: string;
      // more data
    }
  | {
      channel: `bidApproved_${string}`;
      type: "bidApproved";
      bidId: string;
      // more data
    }
  | {
      channel: `tryToMakeNewOwner_${string}`;
      type: "makeOwner";
      makeOwnerObjectId: string;
      // more data
    };

export type Channel = Event["channel"];
