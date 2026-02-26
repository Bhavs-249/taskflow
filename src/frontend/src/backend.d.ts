import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Todo {
    id: TodoId;
    status: TodoStatus;
    title: string;
    createdAt: bigint;
    dueDate?: string;
    description: string;
    priority: TodoPriority;
}
export interface UserProfile {
    name: string;
}
export type TodoId = string;
export enum TodoPriority {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum TodoStatus {
    pending = "pending",
    done = "done",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTodo(title: string, description: string, priority: TodoPriority, dueDate: string | null): Promise<TodoId>;
    deleteTodo(id: TodoId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTodo(id: TodoId): Promise<Todo>;
    getTodoStats(): Promise<{
        total: bigint;
        pending: bigint;
        done: bigint;
        inProgress: bigint;
    }>;
    getTodos(): Promise<Array<Todo>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleStatus(id: TodoId): Promise<void>;
    updateTodo(id: TodoId, title: string, description: string, priority: TodoPriority, status: TodoStatus, dueDate: string | null): Promise<void>;
}
