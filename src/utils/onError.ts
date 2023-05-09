import { toast } from "react-hot-toast";

export const onError = (err: { message: string }) => toast.error(err.message);
