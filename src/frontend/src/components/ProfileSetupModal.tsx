import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";
import { useSaveUserProfile } from "../hooks/useQueries";
import { toast } from "sonner";

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState("");
  const saveProfile = useSaveUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      await saveProfile.mutateAsync({ name: trimmed });
      toast.success("Welcome to TaskFlow! 🎉");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md rounded-2xl border-border"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-3 mx-auto"
            style={{ background: "oklch(0.65 0.14 195 / 0.12)" }}>
            <User className="w-6 h-6" style={{ color: "oklch(0.65 0.14 195)" }} />
          </div>
          <DialogTitle className="text-center text-xl">Set up your profile</DialogTitle>
          <DialogDescription className="text-center">
            Let us know what to call you. This name will appear in your workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Your name</Label>
            <Input
              id="display-name"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="h-11 rounded-xl"
              maxLength={50}
            />
          </div>

          <Button
            type="submit"
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full h-11 rounded-xl font-semibold"
            style={{ background: "oklch(0.65 0.14 195)", color: "white" }}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Get started →"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
