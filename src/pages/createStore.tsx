import PATHS from "utils/paths";
import Layout from "pages/_layout";
import Card from "components/card";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import Spinner from "components/spinner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "components/button";
import { FormInput } from "components/form";
import { api } from "utils/api";
import { onError } from "utils/onError";

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });
  const { mutate: createStore } = api.stores.createStore.useMutation({
    onError,
    onSuccess: async (storeId) => {
      toast.success("Store created successfully");
      await router.push(PATHS.store.path(storeId));
    },
  });

  const handleCreateStore = handleSubmit((data) => {
    createStore({ name: data.name });
  });

  return (
    <Layout>
      <Card className="sm:w-80">
        <div className="text-center">
          <h1>New Store</h1>
        </div>

        <div className="mt-5">
          <form className="grid gap-y-4">
            <FormInput
              field="name"
              label="Store Name"
              type="text"
              register={register}
              errors={errors}
            />

            <div className="mx-auto">
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  void handleCreateStore();
                }}
              >
                {isSubmitting && <Spinner />} Create
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </Layout>
  );
}
