import PATHS, { useMemberRedirect } from "utils/paths";
import Layout from "./_layout";
import Card from "components/card";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import Spinner from "components/spinner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "components/button";
import Href from "components/href";
import { FormInput } from "components/form";
import { api } from "server/communication/api";
import { onError } from "utils/query";

const formSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  useMemberRedirect();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });
  const router = useRouter();
  const { data: session } = useSession();
  const { mutate: loginMember } = api.users.loginMember.useMutation({
    onError,
    onSuccess: async (userId) => {
      const res = await signIn("credentials", {
        id: userId,
        email: getValues().email,
        password: getValues().password,
        session: JSON.stringify(session),
        redirect: false,
      });
      if (res?.ok) {
        router.reload();
      } else {
        toast.error(res?.error || "Something went wrong");
      }
    },
  });

  const handleSignUp = handleSubmit((data) => {
    loginMember({
      email: data.email,
      password: data.password,
    });
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
              {...register("email")}
              errors={errors}
            />
            <FormInput
              field="password"
              label="Password"
              type="password"
              {...register("password")}
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
