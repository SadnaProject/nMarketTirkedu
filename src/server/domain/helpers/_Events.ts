export type Event =
  | {
      channel: `storePurchase_${string}`;
      type: "storePurchase";
      storeId: string;
      message: string;
      // more data
    }
  | {
      channel: `storeChanged_${string}`;
      type: "storeChanged";
      storeId: string;
      message: string;
      // more data
    }
  | {
      channel: `bidAdded_${string}`;
      type: "bidAdded";
      bidId: string;
      message: string;
      // more data
    }
  | {
      channel: `bidApproved_${string}`;
      type: "bidApproved";
      bidId: string;
      message: string;
      // more data
    }
  | {
      channel: `bidRejected_${string}`;
      type: "bidRejected";
      bidId: string;
      message: string;
      // more data
    }
  | {
      channel: `tryToMakeNewOwner_${string}`;
      type: "makeOwner";
      makeOwnerObjectId: string;
      message: string;
      // more data
    }
  | {
      channel: `ApproveMakeNewOwner_${string}`;
      type: "makeOwner";
      makeOwnerObjectId: string;
      message: string;
      // more data
    }
  | {
      channel: `RejectMakeNewOwner_${string}`;
      type: "makeOwner";
      makeOwnerObjectId: string;
      message: string;
      // more data
    };

export type Channel = Event["channel"];
