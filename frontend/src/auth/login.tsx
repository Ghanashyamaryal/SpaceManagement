import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
} from "@/components";
import { useAuth } from "@/context/authcontext";
import type { LoginInput } from "@/schemas/login";
import { loginSchema } from "@/schemas/login";
import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: yupResolver(loginSchema) as any,
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }

      toast.success("Welcome back!");
      login(result.token, result.user);
      navigate("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 font-Inter text-foreground">
      {/* Logo Wrapper */}
      <div className="mb-[-40px] z-10">
        <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center shadow-lg border border-border">
          <span className="text-primary font-bold text-xl uppercase">KH</span>
        </div>
      </div>

      <Card className="w-full max-w-[450px] shadow-2xl border-none pt-12 pb-6 px-4 rounded-3xl bg-card transition-all duration-300">
        <CardContent className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground border-none">
              Welcome to <br /> Space Management System
            </h1>
            <p className="text-muted-foreground font-medium">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-foreground/80">
                Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-primary/70" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={`pl-10 h-14 rounded-xl border-border bg-background text-foreground transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:border-border ${errors.email ? "border-destructive" : ""
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-semibold text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold text-foreground/80">
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-primary/70" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  {...register("password")}
                  className={`pl-10 pr-12 h-14 rounded-xl border-border bg-background text-foreground transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:border-border ${errors.password ? "border-destructive" : ""
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-semibold text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200 text-primary-foreground text-lg font-bold shadow-lg active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="flex flex-col items-center space-y-4 pt-2">
            <Link
              to="/forgot-password"
              className="text-sm font-bold text-foreground/70 hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
            <div className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-bold hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
