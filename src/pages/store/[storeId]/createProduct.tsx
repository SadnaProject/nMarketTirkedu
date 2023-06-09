import PATHS, { useGuestRedirect } from "utils/paths";
import Layout from "../../_layout";
import Card from "components/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import Spinner from "components/spinner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "components/button";
import { FormInput } from "components/form";
import { api } from "server/communication/api";
import { onError } from "utils/query";
import StoreNavbar from "components/storeNavbar";

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters"),
  price: z.preprocess(Number, z.number().positive("Price must be positive")),
  category: z
    .string()
    .min(3, "Category must be at least 3 characters")
    .max(50, "Category must be at most 50 characters"),
  quantity: z.preprocess(
    Number,
    z.number().min(0, "Quantity can't be negative")
  ),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters")
    .max(500, "Description must be at most 500 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  useGuestRedirect();
  const router = useRouter();
  const storeId = z.undefined().or(z.string()).parse(router.query.storeId);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });
  const { mutate: createProduct } = api.stores.createProduct.useMutation({
    onError,
    onSuccess: async () => {
      toast.success("Product created successfully");
      await router.push(PATHS.store.path(storeId as string));
    },
  });

  const handleCreateProduct = handleSubmit((data) => {
    createProduct({ ...data, storeId: storeId as string });
  });

  return (
    <Layout>
      <StoreNavbar storeId={storeId} />
      <Card className="sm:w-80">
        <div className="text-center">
          <h1>New Product</h1>
        </div>

        <div className="mt-5">
          <form className="grid gap-y-4">
            <FormInput
              field="name"
              label="Product Name"
              type="text"
              {...register("name")}
              errors={errors}
            />
            <FormInput
              field="category"
              label="Category"
              type="text"
              {...register("category")}
              errors={errors}
            />
            <FormInput
              field="description"
              label="Description"
              type="text"
              {...register("description")}
              errors={errors}
            />
            <FormInput
              field="price"
              label="Price"
              type="text"
              {...register("price")}
              errors={errors}
            />
            <FormInput
              field="quantity"
              label="Quantity"
              type="text"
              {...register("quantity")}
              errors={errors}
            />

            <div className="mx-auto">
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  void handleCreateProduct();
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
