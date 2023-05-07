import PATHS from "utils/paths";
import Layout from "./_layout";
import Card from "components/card";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import Spinner from "components/spinner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "components/button";
import Href from "components/href";
import { FormInput } from "components/form";

const formSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });
  const router = useRouter();

  const handleSignUp = handleSubmit(async (data) => {
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (res?.ok) {
      await router.push(PATHS.home.path);
    } else {
      toast.error(res?.error || "Something went wrong");
    }
  });

  return (
    <Layout>
      <Card>
        <div className="text-center">
          <h1>Login</h1>
          <p className="mt-2 flex flex-wrap justify-center gap-x-1 text-sm text-slate-600">
            <span>Don&apos;t have an account? </span>
            <Href className="font-medium" href={PATHS.register.path}>
              Sign up here
            </Href>
          </p>
        </div>

        <div className="mt-5">
          <form className="grid gap-y-4">
            <FormInput
              field="email"
              label="Email address"
              type="email"
              register={register}
              errors={errors}
            />
            <FormInput
              field="password"
              label="Password"
              type="password"
              register={register}
              errors={errors}
            />

            <div className="mx-auto">
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  void handleSignUp();
                }}
              >
                {isSubmitting && <Spinner />} Login
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </Layout>
  );
}
