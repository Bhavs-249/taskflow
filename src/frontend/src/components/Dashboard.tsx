import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckSquare,
  Plus,
  LogOut,
  User,
  ChevronDown,
  ClipboardList,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { useGetTodos } from "../hooks/useQueries";
import { Todo, TodoPriority, TodoStatus } from "../backend.d";
import StatsRow from "./StatsRow";
import TodoCard from "./TodoCard";
import TodoModal from "./TodoModal";
import { Toaster } from "@/components/ui/sonner";

interface DashboardProps {
  userName: string;
}

type StatusFilter = "all" | TodoStatus;
type PriorityFilter = "all" | TodoPriority;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All status" },
  { value: TodoStatus.pending, label: "Pending" },
  { value: TodoStatus.inProgress, label: "In Progress" },
  { value: TodoStatus.done, label: "Done" },
];

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: "all", label: "All priority" },
  { value: TodoPriority.high, label: "High" },
  { value: TodoPriority.medium, label: "Medium" },
  { value: TodoPriority.low, label: "Low" },
];

function TodoListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-card rounded-xl border border-border shadow-xs p-4 flex flex-col gap-3"
        >
          <div className="flex gap-2">
            <Skeleton className="w-16 h-5 rounded-lg" />
            <Skeleton className="w-20 h-5 rounded-lg" />
          </div>
          <Skeleton className="w-3/4 h-4 rounded" />
          <Skeleton className="w-full h-3 rounded" />
          <Skeleton className="w-1/2 h-3 rounded" />
          <div className="flex justify-between mt-2">
            <Skeleton className="w-24 h-3 rounded" />
            <Skeleton className="w-20 h-6 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "oklch(0.65 0.14 195 / 0.08)" }}
      >
        <ClipboardList className="w-10 h-10" style={{ color: "oklch(0.65 0.14 195 / 0.5)" }} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No tasks yet
      </h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">
        Create your first task and start organizing your work. Stay focused, ship more.
      </p>
      <Button
        onClick={onCreateClick}
        className="rounded-xl h-10 px-5 font-semibold gap-2"
        style={{ background: "oklch(0.65 0.14 195)", color: "white" }}
      >
        <Plus className="w-4 h-4" />
        Create your first task
      </Button>
    </div>
  );
}

function NoResultsState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "oklch(0.65 0.14 195 / 0.08)" }}
      >
        <Search className="w-8 h-8" style={{ color: "oklch(0.65 0.14 195 / 0.5)" }} />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        No matching tasks
      </h3>
      <p className="text-muted-foreground text-sm">
        Try adjusting your filters or search query.
      </p>
    </div>
  );
}

export default function Dashboard({ userName }: DashboardProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: todos = [], isLoading } = useGetTodos();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleOpenCreate = () => {
    setEditingTodo(null);
    setModalOpen(true);
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingTodo(null);
  };

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (statusFilter !== "all" && todo.status !== statusFilter) return false;
      if (priorityFilter !== "all" && todo.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          todo.title.toLowerCase().includes(q) ||
          todo.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [todos, statusFilter, priorityFilter, searchQuery]);

  const activeFilterCount = [
    statusFilter !== "all",
    priorityFilter !== "all",
    searchQuery.trim() !== "",
  ].filter(Boolean).length;

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const currentStatusLabel = STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "All status";
  const currentPriorityLabel = PRIORITY_OPTIONS.find((o) => o.value === priorityFilter)?.label ?? "All priority";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.65 0.14 195)" }}
            >
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight hidden sm:block">
              Task<span style={{ color: "oklch(0.65 0.14 195)" }}>Flow</span>
            </span>
          </div>

          {/* Right: user + logout */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 rounded-xl h-9 px-3 text-sm font-medium"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: "oklch(0.65 0.14 195)" }}
                >
                  {initials || <User className="w-3.5 h-3.5" />}
                </div>
                <span className="max-w-[120px] truncate hidden sm:block">{userName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="text-sm font-medium truncate">{userName}</p>
              </div>
              <div className="h-px bg-border mx-1" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 text-destructive focus:text-destructive rounded-lg m-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Hero band */}
      <div
        className="border-b border-border"
        style={{
          background: "linear-gradient(135deg, oklch(0.65 0.14 195 / 0.08) 0%, oklch(0.72 0.16 75 / 0.05) 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">
            Good {getTimeOfDay()},{" "}
            <span style={{ color: "oklch(0.55 0.14 195)" }}>{userName.split(" ")[0]}</span>
            <span className="ml-1">👋</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's your task overview for today.
          </p>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full space-y-6">
        {/* Stats */}
        <StatsRow />

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-xl text-sm"
            />
          </div>

          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`gap-1.5 rounded-xl h-9 text-sm ${statusFilter !== "all" ? "border-primary/50 text-primary" : ""}`}
              >
                {currentStatusLabel}
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl" align="start">
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`rounded-lg m-0.5 cursor-pointer ${statusFilter === opt.value ? "font-medium" : ""}`}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`gap-1.5 rounded-xl h-9 text-sm ${priorityFilter !== "all" ? "border-primary/50 text-primary" : ""}`}
              >
                {currentPriorityLabel}
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl" align="start">
              {PRIORITY_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setPriorityFilter(opt.value)}
                  className={`rounded-lg m-0.5 cursor-pointer ${priorityFilter === opt.value ? "font-medium" : ""}`}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl h-9 text-sm text-muted-foreground gap-1.5"
              onClick={() => {
                setStatusFilter("all");
                setPriorityFilter("all");
                setSearchQuery("");
              }}
            >
              Clear
              <Badge
                variant="secondary"
                className="rounded-md text-xs px-1.5 py-0 h-4"
              >
                {activeFilterCount}
              </Badge>
            </Button>
          )}

          {/* Spacer + total count */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {filteredTodos.length} task{filteredTodos.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Todos grid */}
        {isLoading ? (
          <TodoListSkeleton />
        ) : todos.length === 0 ? (
          <EmptyState onCreateClick={handleOpenCreate} />
        ) : filteredTodos.length === 0 ? (
          <NoResultsState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTodos.map((todo, index) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onEdit={handleEdit}
                index={index}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-muted-foreground">
          © 2026. Built with ❤️ using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>

      {/* FAB */}
      <button
        type="button"
        onClick={handleOpenCreate}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-card-lifted flex items-center justify-center text-white transition-transform duration-200 hover:scale-110 active:scale-95 animate-pulse-ring z-50"
        style={{ background: "oklch(0.65 0.14 195)" }}
        aria-label="Create new task"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Todo modal */}
      <TodoModal
        open={modalOpen}
        onClose={handleModalClose}
        todo={editingTodo}
      />
    </div>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
