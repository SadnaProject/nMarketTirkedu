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
    };

export type Channel = Event["channel"];
