import React from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare } from "lucide-react";
import LoginScreen from "./components/LoginScreen";
import ProfileSetupModal from "./components/ProfileSetupModal";
import Dashboard from "./components/Dashboard";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import { Toaster } from "@/components/ui/sonner";

function AppLoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse"
          style={{ background: "oklch(0.65 0.14 195)" }}
        >
          <CheckSquare className="w-6 h-6 text-white" />
        </div>
        <div className="space-y-2 w-48">
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-2 w-3/4 rounded-full mx-auto" />
        </div>
        <p className="text-sm text-muted-foreground">Loading TaskFlow...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  // Show loading during initialization
  if (isInitializing) {
    return <AppLoadingScreen />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginScreen />
      </>
    );
  }

  // Show loading while profile data is being fetched
  if (profileLoading || !profileFetched) {
    return <AppLoadingScreen />;
  }

  // Show profile setup if no profile exists
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  if (showProfileSetup) {
    return (
      <>
        <Toaster position="top-right" richColors />
        {/* Blurred background hinting at the app */}
        <div
          className="min-h-screen bg-background flex items-center justify-center"
          style={{ filter: "none" }}
        >
          <ProfileSetupModal open={true} />
        </div>
      </>
    );
  }

  // Show main dashboard
  return (
    <Dashboard userName={userProfile?.name ?? "User"} />
  );
}
