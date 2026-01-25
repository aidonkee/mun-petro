import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe2, Shield, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated && role) {
    navigate(role === "admin" ? "/admin" : "/delegate", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && !selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select a role to sign up",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, selectedRole as "admin" | "delegate");
        if (error) {
          let message = error.message;
          if (message.includes("already registered")) {
            message = "An account with this email already exists. Please sign in instead.";
          }
          toast({
            title: "Sign Up Failed",
            description: message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account Created",
            description: "You can now sign in with your credentials.",
          });
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          let message = error.message;
          if (message.includes("Invalid login")) {
            message = "Invalid email or password. Please try again.";
          }
          toast({
            title: "Sign In Failed",
            description: message,
            variant: "destructive",
          });
        }
        // Navigation will happen automatically via auth state change
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-primary/30" />
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Globe2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-white">
                MUN Platform
              </h1>
              <p className="text-sm text-white/60">Diplomatic Excellence</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-4xl font-bold text-white leading-tight">
                Empowering the Next Generation of Diplomats
              </h2>
              <p className="mt-4 text-white/70 text-lg leading-relaxed">
                A comprehensive platform for Model United Nations education,
                designed to streamline committee management and enhance delegate
                preparation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-heading font-bold text-white">
                  500+
                </div>
                <div className="text-white/60 text-sm">Active Delegates</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-heading font-bold text-white">
                  50+
                </div>
                <div className="text-white/60 text-sm">Committees</div>
              </div>
            </div>
          </div>

          <p className="text-white/40 text-sm">
            © 2026 MUN Platform. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Globe2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-heading text-xl font-bold">MUN Platform</h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="font-heading text-2xl font-bold">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isSignUp ? "Sign up to access the platform" : "Sign in to access your dashboard"}
            </p>
          </div>

          {/* Role Selection - Only show for sign up */}
          {isSignUp && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Your Role</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  className={cn(
                    "relative p-5 rounded-xl border-2 transition-all duration-200 text-left",
                    selectedRole === "admin"
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center mb-3",
                      selectedRole === "admin"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="font-medium">Administrator</div>
                  <div className="text-sm text-muted-foreground">
                    Manage students & grading
                  </div>
                  {selectedRole === "admin" && (
                    <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-primary" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("delegate")}
                  className={cn(
                    "relative p-5 rounded-xl border-2 transition-all duration-200 text-left",
                    selectedRole === "delegate"
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center mb-3",
                      selectedRole === "delegate"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <User className="w-6 h-6" />
                  </div>
                  <div className="font-medium">Delegate</div>
                  <div className="text-sm text-muted-foreground">
                    Access learning tools
                  </div>
                  {selectedRole === "delegate" && (
                    <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-primary" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base gap-2"
              disabled={isLoading || (isSignUp && !selectedRole)}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
