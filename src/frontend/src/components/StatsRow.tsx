import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ListChecks, Clock, Loader, CheckCircle2 } from "lucide-react";
import { useGetTodoStats } from "../hooks/useQueries";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.FC<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  delay: string;
}

function StatCard({ label, value, icon: Icon, colorClass, bgClass, delay }: StatCardProps) {
  return (
    <div
      className={`bg-card rounded-xl border border-border p-4 flex items-center gap-3 shadow-xs animate-slide-up ${delay}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="space-y-1.5">
        <Skeleton className="w-8 h-6 rounded" />
        <Skeleton className="w-16 h-3 rounded" />
      </div>
    </div>
  );
}

export default function StatsRow() {
  const { data: stats, isLoading } = useGetTodoStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const total = Number(stats?.total ?? 0);
  const pending = Number(stats?.pending ?? 0);
  const inProgress = Number(stats?.inProgress ?? 0);
  const done = Number(stats?.done ?? 0);

  const cards: StatCardProps[] = [
    {
      label: "Total tasks",
      value: total,
      icon: ListChecks,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
      delay: "stagger-1",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      colorClass: "text-slate-500",
      bgClass: "bg-slate-100",
      delay: "stagger-2",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Loader,
      colorClass: "text-blue-600",
      bgClass: "bg-blue-50",
      delay: "stagger-3",
    },
    {
      label: "Completed",
      value: done,
      icon: CheckCircle2,
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
      delay: "stagger-4",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
