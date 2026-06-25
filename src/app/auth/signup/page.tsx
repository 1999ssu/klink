// src/app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    agreePolicy: z.boolean().refine((val) => val === true, {
      message: "You must agree to the no-return policy to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.name);
      toast.success("Account created! Welcome to KStyle CA.");
      router.push("/");
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.message.includes("email-already-in-use")
      ) {
        toast.error("This email is already registered.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="font-display text-4xl font-bold text-primary tracking-tight">
              KStyle CA
            </h1>
          </Link>
          <p className="mt-2 text-gray-500 text-sm">
            Korean Fashion · Delivered to Canada
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                {...register("name")}
                type="text"
                placeholder="John Doe"
                className="input-base"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="input-base"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="input-base"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="••••••••"
                className="input-base"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* 반품 정책 동의 (필수) */}
            <div className="bg-amber-50 border border-amber-200 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  {...register("agreePolicy")}
                  type="checkbox"
                  className="mt-0.5 accent-primary"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  <strong className="text-amber-700">Important:</strong> I
                  understand that KStyle CA acts as an intermediary. All sales
                  are <strong>final — no returns, exchanges, or refunds</strong>{" "}
                  are accepted for international orders.
                </span>
              </label>
              {errors.agreePolicy && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.agreePolicy.message}
                </p>
              )}
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* 로그인 링크 */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
