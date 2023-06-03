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

const formSchema = z
  .object({
    email: z
      .string()
      .nonempty("Email is required")
      .email("Invalid email address"),
    password: z.string().min(5, "Password must be at least 5 characters"),
    passwordConfirm: z
      .string()
      .min(5, "Password must be at least 5 characters"),
  })
  .refine((obj) => obj.password === obj.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  useMemberRedirect();
  const router = useRouter();
  const { data: session } = useSession();
  const { mutate: registerMember } = api.users.registerMember.useMutation({
    onSuccess: (userId) => {
      // toast.success("Account created successfully");
      void loginMember(userId);
    },
    onError,
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const handleSignUp = handleSubmit((data) => {
    registerMember({
      email: data.email,
      password: data.password,
    });
  });

  const loginMember = async (userId: string) => {
    const values = getValues();
    const res = await signIn("credentials", {
      id: userId,
      email: values.email,
      password: values.password,
      session: JSON.stringify(session),
      redirect: false,
    });
    if (res?.ok) {
      router.reload();
    } else {
      toast.error(res?.error || "Something went wrong");
    }
  };

  return (
    <Layout>
      <Card>
        <div className="text-center">
          <h1>Sign Up</h1>
          <p className="mt-2 flex flex-wrap justify-center gap-x-1 text-sm text-slate-600">
            <span>Already have an account? </span>
            <Href className="font-medium" href={PATHS.login.path}>
              Login here
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
            <FormInput
              field="passwordConfirm"
              label="Confirm Password"
              type="password"
              {...register("passwordConfirm")}
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
                {isSubmitting && <Spinner />} Sign Up
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </Layout>
  );
}
