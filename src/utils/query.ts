import { toast } from "react-hot-toast";
import * as dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

export const onError = (err: { message: string }) => toast.error(err.message);

export const cachedQueryOptions = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
  staleTime: dayjs.duration({ minutes: 5 }).asMilliseconds(),
  onError,
};
