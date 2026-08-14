export type WorkspaceRole = "ADMIN" | "MEMBER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskType = "TASK" | "BUG" | "FEATURE" | "IMPROVEMENT" | "OTHER";
export type ProjectStatus = "ACTIVE" | "PLANNING" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  taskId: string;
  createdAt: string;
  user: User;
}

export interface Task {
  id: string;
  task:string,
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  type: TaskType;
  priority: Priority;
  assigneeId: string;
  due_date: string;
  createdAt: string;
  updatedAt: string;
  assignee: User;
  comments: Comment[];
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  priority: Priority;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  team_lead: string;
  workspaceId: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
  tasks: Task[];
}

export interface WorkspaceMember {
  id: string;
  email:string;
  userId: string;
  workspaceId: string;
  message: string;
  role: WorkspaceRole;
  user: User;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  settings: Record<string, unknown>;
  ownerId: string;
  createdAt: string;
  image_url: string;
  updatedAt: string;
  members: WorkspaceMember[];
  projects: Project[];
  owner: User;
}