import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { TodoPriority, TodoStatus, Todo } from "../backend.d";
import { useCreateTodo, useUpdateTodo } from "../hooks/useQueries";
import { toast } from "sonner";

interface TodoModalProps {
  open: boolean;
  onClose: () => void;
  todo?: Todo | null;
}

const defaultForm = {
  title: "",
  description: "",
  priority: TodoPriority.medium,
  status: TodoStatus.pending,
  dueDate: "",
};

export default function TodoModal({ open, onClose, todo }: TodoModalProps) {
  const isEditing = !!todo;
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (open) {
      if (todo) {
        setForm({
          title: todo.title,
          description: todo.description,
          priority: todo.priority,
          status: todo.status,
          dueDate: todo.dueDate || "",
        });
      } else {
        setForm(defaultForm);
      }
      setErrors({});
    }
  }, [open, todo]);

  const validate = () => {
    const newErrors: { title?: string } = {};
    if (!form.title.trim()) {
      newErrors.title = "Title is required";
    } else if (form.title.trim().length < 2) {
      newErrors.title = "Title must be at least 2 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dueDate = form.dueDate || null;

    try {
      if (isEditing && todo) {
        await updateTodo.mutateAsync({
          id: todo.id,
          title: form.title.trim(),
          description: form.description.trim(),
          priority: form.priority,
          status: form.status,
          dueDate,
        });
        toast.success("Task updated successfully");
      } else {
        await createTodo.mutateAsync({
          title: form.title.trim(),
          description: form.description.trim(),
          priority: form.priority,
          dueDate,
        });
        toast.success("Task created successfully");
      }
      onClose();
    } catch {
      toast.error(`Failed to ${isEditing ? "update" : "create"} task`);
    }
  };

  const isPending = createTodo.isPending || updateTodo.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isPending && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? "Edit task" : "Create new task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="todo-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="todo-title"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => {
                setForm((f) => ({ ...f, title: e.target.value }));
                if (errors.title) setErrors({});
              }}
              className={`h-10 rounded-xl ${errors.title ? "border-destructive" : ""}`}
              autoFocus
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="todo-desc" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="todo-desc"
              placeholder="Add more details (optional)..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="rounded-xl resize-none min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Priority & Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, priority: v as TodoPriority }))
                }
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value={TodoPriority.high}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                      High
                    </span>
                  </SelectItem>
                  <SelectItem value={TodoPriority.medium}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      Medium
                    </span>
                  </SelectItem>
                  <SelectItem value={TodoPriority.low}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Low
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isEditing && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as TodoStatus }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value={TodoStatus.pending}>Pending</SelectItem>
                    <SelectItem value={TodoStatus.inProgress}>In Progress</SelectItem>
                    <SelectItem value={TodoStatus.done}>Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label htmlFor="todo-due" className="text-sm font-medium">
              Due date{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="todo-due"
              type="date"
              value={form.dueDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, dueDate: e.target.value }))
              }
              className="h-10 rounded-xl"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl h-10 font-semibold min-w-[100px]"
              style={{ background: "oklch(0.65 0.14 195)", color: "white" }}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Saving..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Create task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
