export type Event =
  | {
      channel: `storePurchase_${string}`;
      type: "storePurchase";
      storeId: string;
      message: "You have a new purchase!";
      // more data
    }
  | {
      channel: `storeChanged_${string}`;
      type: "storeChanged";
      storeId: string;
      description: string;
      message: "Store details has changed!";
      // more data
    }
  | {
      channel: `bidAdded_${string}`;
      type: "bidAdded";
      bidId: string;
      message: "You have a new bid!";
      // more data
    }
  | {
      channel: `bidApproved_${string}`;
      type: "bidApproved";
      bidId: string;
      message: "Your bid has been approved!";
      // more data
    }
  | {
      channel: `bidRejected_${string}`;
      type: "bidRejected";
      bidId: string;
      message: "Your bid has been rejected!";
      // more data
    }
  | {
      channel: `tryToMakeNewOwner_${string}`;
      type: "makeOwner";
      makeOwnerObjectId: string;
      message: "You have a new request to be an owner!";
      // more data
    };

export type Channel = Event["channel"];
