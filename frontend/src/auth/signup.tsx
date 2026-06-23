import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { useAuth } from "@/context/authcontext";
import type { SignupInput } from "@/schemas/signup";
import { signupSchema } from "@/schemas/signup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Building2, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [branches, setBranches] = useState<{ _id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: yupResolver(signupSchema) as any,
  });

  useEffect(() => {
    // Public endpoint — no auth needed since the user isn't logged in yet.
    fetch("/api/public/branches")
      .then((res) => res.json())
      .then((data) => setBranches(data?.branches || []))
      .catch(() => setBranches([]));
  }, []);

  const onSubmit = async (data: SignupInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Signup failed");
      }

      toast.success("Welcome to Knowledge Hub!");
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
              Create Account
            </h1>
            <p className="text-muted-foreground font-medium">Join Knowledge Hub today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm font-bold text-foreground/80">
                Full Name
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register("name")}
                  className={`pl-10 h-12 rounded-xl border-border bg-background text-foreground transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:border-border ${errors.name ? "border-destructive" : ""
                    }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-semibold text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
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
                  className={`pl-10 h-12 rounded-xl border-border bg-background text-foreground transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:border-border ${errors.email ? "border-destructive" : ""
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-semibold text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone" className="text-sm font-bold text-foreground/80">
                Phone (Optional)
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-primary/70" />
                </div>
                <Input
                  id="phone"
                  placeholder="+1234567890"
                  {...register("phone")}
                  className={`pl-10 h-12 rounded-xl border-border bg-background text-foreground transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:border-border ${errors.phone ? "border-destructive" : ""
                    }`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs font-semibold text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="branch" className="text-sm font-bold text-foreground/80">
                Branch
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Building2 className="h-5 w-5 text-primary/70" />
                </div>
                <Controller
                  name="branch"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="branch"
                        className={`w-full pl-10 h-12 rounded-xl border-border bg-background text-foreground transition-all duration-200 ${errors.branch ? "border-destructive" : ""
                          }`}
                      >
                        <SelectValue placeholder="Select a branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => (
                          <SelectItem key={b._id} value={b._id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {errors.branch && (
                <p className="text-xs font-semibold text-destructive mt-1">{errors.branch.message}</p>
              )}
            </div>

            <div className="space-y-1">
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
                  placeholder="Enter Password"
                  {...register("password")}
                  className={`pl-10 pr-12 h-12 rounded-xl border-border bg-background text-foreground transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:border-border ${errors.password ? "border-destructive" : ""
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
              className="w-full h-12 mt-2 rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200 text-primary-foreground text-lg font-bold shadow-lg active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          <div className="text-center text-sm pt-2">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary font-bold hover:underline transition-colors">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
