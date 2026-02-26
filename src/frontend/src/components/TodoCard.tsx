import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  CalendarDays,
} from "lucide-react";
import { Todo, TodoPriority, TodoStatus } from "../backend.d";
import { useDeleteTodo, useToggleStatus } from "../hooks/useQueries";
import { toast } from "sonner";

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  index: number;
}

const PRIORITY_CONFIG: Record<
  TodoPriority,
  { label: string; dot: string; bg: string; text: string }
> = {
  [TodoPriority.high]: {
    label: "High",
    dot: "bg-red-500",
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
  },
  [TodoPriority.medium]: {
    label: "Medium",
    dot: "bg-amber-500",
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
  },
  [TodoPriority.low]: {
    label: "Low",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
  },
};

const STATUS_CONFIG: Record<
  TodoStatus,
  { label: string; icon: React.FC<{ className?: string }>; bg: string; text: string }
> = {
  [TodoStatus.pending]: {
    label: "Pending",
    icon: Circle,
    bg: "bg-slate-100 border-slate-200",
    text: "text-slate-600",
  },
  [TodoStatus.inProgress]: {
    label: "In Progress",
    icon: Clock,
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
  },
  [TodoStatus.done]: {
    label: "Done",
    icon: CheckCircle2,
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
  },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCreatedAt(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  const d = new Date(ms);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function isDueSoon(dateStr: string): boolean {
  const due = new Date(dateStr);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // within 3 days
}

function isOverdue(dateStr: string): boolean {
  const due = new Date(dateStr);
  due.setHours(23, 59, 59);
  return due < new Date();
}

export default function TodoCard({ todo, onEdit, index }: TodoCardProps) {
  const deleteTodo = useDeleteTodo();
  const toggleStatus = useToggleStatus();

  const priority = PRIORITY_CONFIG[todo.priority];
  const status = STATUS_CONFIG[todo.status];
  const StatusIcon = status.icon;

  const isDone = todo.status === TodoStatus.done;

  const handleDelete = async () => {
    try {
      await deleteTodo.mutateAsync(todo.id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleToggle = async () => {
    try {
      await toggleStatus.mutateAsync(todo.id);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const delayClass = [`stagger-1`, `stagger-2`, `stagger-3`, `stagger-4`][
    Math.min(index % 4, 3)
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <article
        className={`group bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 flex flex-col animate-slide-up ${delayClass} ${isDone ? "opacity-70" : ""}`}
      >
        {/* Priority indicator strip at left edge */}
        <div className="flex flex-1">
          <div
            className={`w-1 rounded-l-xl shrink-0 ${todo.priority === TodoPriority.high
              ? "bg-red-500"
              : todo.priority === TodoPriority.medium
              ? "bg-amber-500"
              : "bg-emerald-500"
            }`}
          />

          <div className="flex-1 p-4 flex flex-col gap-3 min-w-0">
            {/* Header: badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${priority.bg} ${priority.text} gap-1.5`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priority.dot}`} />
                {priority.label}
              </Badge>

              <Badge
                variant="outline"
                className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${status.bg} ${status.text} gap-1`}
              >
                <StatusIcon className="w-3 h-3 shrink-0" />
                {status.label}
              </Badge>
            </div>

            {/* Title */}
            <div className="min-w-0">
              <h3
                className={`font-semibold text-sm leading-snug truncate ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}
                title={todo.title}
              >
                {todo.title}
              </h3>

              {todo.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {todo.description}
                </p>
              )}
            </div>

            {/* Footer: dates + actions */}
            <div className="flex items-center justify-between gap-2 mt-auto">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {todo.dueDate && (
                  <span
                    className={`flex items-center gap-1 ${
                      isOverdue(todo.dueDate) && !isDone
                        ? "text-red-600 font-medium"
                        : isDueSoon(todo.dueDate) && !isDone
                        ? "text-amber-600 font-medium"
                        : ""
                    }`}
                  >
                    <CalendarDays className="w-3 h-3" />
                    {isOverdue(todo.dueDate) && !isDone ? "Overdue · " : ""}
                    {formatDate(todo.dueDate)}
                  </span>
                )}
                <span className="text-muted-foreground/70">
                  {formatCreatedAt(todo.createdAt)}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg hover:bg-secondary"
                      onClick={handleToggle}
                      disabled={toggleStatus.isPending}
                    >
                      {isDone ? (
                        <Circle className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.14 195)" }} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="rounded-lg text-xs">
                    {isDone ? "Mark pending" : "Mark done"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg hover:bg-secondary"
                      onClick={() => onEdit(todo)}
                    >
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="rounded-lg text-xs">
                    Edit task
                  </TooltipContent>
                </Tooltip>

                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="rounded-lg text-xs">
                      Delete task
                    </TooltipContent>
                  </Tooltip>

                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                      <AlertDialogDescription>
                        <strong className="font-medium text-foreground">
                          {todo.title}
                        </strong>{" "}
                        will be permanently deleted. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDelete}
                        disabled={deleteTodo.isPending}
                      >
                        {deleteTodo.isPending ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </article>
    </TooltipProvider>
  );
}
