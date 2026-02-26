import React from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, CheckSquare, Zap, Shield, Users } from "lucide-react";

export default function LoginScreen() {
  const { login, clear, loginStatus, isLoggingIn, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === "User is already authenticated") {
        await clear();
        queryClient.clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const features = [
    { icon: Zap, text: "Lightning-fast task management", key: "speed" },
    { icon: Shield, text: "Your data, completely private", key: "privacy" },
    { icon: Users, text: "Separate workspace for each user", key: "isolation" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, oklch(0.65 0.14 195) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.16 75) 0%, transparent 70%)",
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(oklch(0.13 0.02 260) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.13 0.02 260) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Logo & Title */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-card-lifted"
            style={{ background: "oklch(0.65 0.14 195)" }}>
            <CheckSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
            Task<span style={{ color: "oklch(0.65 0.14 195)" }}>Flow</span>
          </h1>
          <p className="text-muted-foreground text-base">
            Organize your work. Ship your goals.
          </p>
        </div>

        {/* Main card */}
        <div
          className="bg-card rounded-2xl p-8 shadow-card-lifted border border-border animate-slide-up stagger-1"
        >
          {/* Feature list */}
          <div className="space-y-3 mb-8">
            {features.map(({ icon: Icon, text, key }) => (
              <div key={key} className="flex items-center gap-3">
                <div
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "oklch(0.65 0.14 195 / 0.12)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "oklch(0.65 0.14 195)" }} />
                </div>
                <span className="text-sm text-foreground/80">{text}</span>
              </div>
            ))}
          </div>

          <div className="h-px bg-border mb-6" />

          {/* Login action */}
          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn || isInitializing}
              className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-200"
              style={{
                background: "oklch(0.65 0.14 195)",
                color: "white",
              }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              New users are automatically registered on first login.
              <br />
              Your tasks are private and only visible to you.
            </p>
          </div>
        </div>

        {/* Login status error */}
        {loginStatus === "loginError" && (
          <div className="mt-4 p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-center animate-slide-up">
            <p className="text-sm text-destructive">
              Login failed. Please try again.
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2026. Built with ❤️ using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
