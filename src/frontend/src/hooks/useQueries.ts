import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { Todo, TodoPriority, TodoStatus, UserProfile } from "../backend.d";

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── Todos ───────────────────────────────────────────────────────────────────

export function useGetTodos() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodos();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetTodo(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Todo>({
    queryKey: ["todo", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getTodo(id);
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

export function useGetTodoStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    total: bigint;
    pending: bigint;
    done: bigint;
    inProgress: bigint;
  }>({
    queryKey: ["todoStats"],
    queryFn: async () => {
      if (!actor) return { total: 0n, pending: 0n, done: 0n, inProgress: 0n };
      return actor.getTodoStats();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateTodo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      priority,
      dueDate,
    }: {
      title: string;
      description: string;
      priority: TodoPriority;
      dueDate: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createTodo(title, description, priority, dueDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todoStats"] });
    },
  });
}

export function useUpdateTodo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      priority,
      status,
      dueDate,
    }: {
      id: string;
      title: string;
      description: string;
      priority: TodoPriority;
      status: TodoStatus;
      dueDate: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTodo(id, title, description, priority, status, dueDate);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todo", vars.id] });
      queryClient.invalidateQueries({ queryKey: ["todoStats"] });
    },
  });
}

export function useDeleteTodo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteTodo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todoStats"] });
    },
  });
}

export function useToggleStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.toggleStatus(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todoStats"] });
    },
  });
}
