"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { login } from "@/lib/action";
import { Eye, EyeClosed } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await login(formData);
    if (result.ok) {
      toast.success("Login successful!");
      setLoading(false);
      router.push("/console");
      return;
    }
    if (!result.ok) {
      toast.error(result.message || "Login failed");
      setLoading(false);
      return;
    }
    setLoading(false);
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your console
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@mail.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  {showPassword ? (
                    <EyeClosed
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1 cursor-pointer"
                    />
                  ) : (
                    <Eye
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1 cursor-pointer"
                    />
                  )}
                  <Input
                    id="password"
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                  />
                </div>
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src={
                "https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=srgb&fm=jpg&ixid=M3w2NjMyNTh8MHwxfHNlYXJjaHw0fHxkYXNoYm9hcmR8ZW58MHx8fHwxNzY0Nzc1NTc1fDA&ixlib=rb-4.1.0&q=85"
              }
              fill
              alt="Login"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <Link href="#">Terms of Service</Link>{" "}
        and <Link href="#">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
}
