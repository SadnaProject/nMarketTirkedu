import { api } from "server/communication/api";
import { useState } from "react";
import Button from "components/button";
import { toast } from "react-hot-toast";

export default function AboutPage() {
  const [num, setNumber] = useState<number>();
  api.example.randomNumber.useSubscription(undefined, {
    onData(n) {
      setNumber(n);
    },
  });
  api.example.onNotifyAll.useSubscription(undefined, {
    onData(msg) {
      toast.success(msg);
    },
  });
  const { mutate: notifyAll } = api.example.notifyAll.useMutation();
  const { mutate: addNotification } = api.users.addNotification.useMutation();
  const { mutate: addNotificationEvent } =
    api.example.addNotificationEvent.useMutation();

  return (
    <div>
      Here&apos;s a random number from a sub: {num} <br />
      <br />
      <Button
        onClick={() =>
          void notifyAll({
            message: `The time is ${new Date().toLocaleTimeString()}`,
          })
        }
      >
        Notify All
      </Button>
      <Button
        onClick={() => {
          addNotification({
            notification: "This is a notification",
            notificationType: "test",
          });
          addNotificationEvent();
        }}
      >
        Add Notification
      </Button>
    </div>
  );
}
