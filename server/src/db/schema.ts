import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  integer,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

// ---------- Enums (match schema.prisma exactly) ----------
export const workspaceRoleEnum = pgEnum("WorkspaceRole", ["ADMIN", "MEMBER"]);
export const taskStatusEnum = pgEnum("TaskStatus", ["TODO", "IN_PROGRESS", "DONE"]);
export const taskTypeEnum = pgEnum("TaskType", ["TASK", "BUG", "FEATURE", "IMPROVEMENT", "OTHER"]);
export const projectStatusEnum = pgEnum("ProjectStatus", [
  "ACTIVE",
  "PLANNING",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
]);
export const priorityEnum = pgEnum("Priority", ["LOW", "MEDIUM", "HIGH"]);

// ---------- User ----------
export const users = pgTable("User", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  image: text("image").notNull().default(""),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// ---------- Workspace ----------
export const workspaces = pgTable("Workspace", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  settings: jsonb("settings").notNull().default({}),
  ownerId: text("ownerId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  image_url: text("image_url").notNull().default(""),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// ---------- WorkspaceMember ----------
export const workspaceMembers = pgTable(
  "WorkspaceMember",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: text("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    message: text("message").notNull().default(""),
    role: workspaceRoleEnum("role").notNull().default("MEMBER"),
  },
  (table) => ({
    userWorkspaceUnique: uniqueIndex("workspace_member_user_workspace_unique").on(
      table.userId,
      table.workspaceId
    ),
  })
);

// ---------- Project ----------
export const projects = pgTable("Project", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  priority: priorityEnum("priority").notNull().default("MEDIUM"),
  status: projectStatusEnum("status").notNull().default("ACTIVE"),
  start_date: timestamp("start_date"),
  end_date: timestamp("end_date"),
  team_lead: text("team_lead")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  workspaceId: text("workspaceId")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// ---------- ProjectMember ----------
export const projectMembers = pgTable(
  "ProjectMember",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: text("projectId")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
  },
  (table) => ({
    userProjectUnique: uniqueIndex("project_member_user_project_unique").on(
      table.userId,
      table.projectId
    ),
  })
);

// ---------- Task ----------
export const tasks = pgTable("Task", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("projectId")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("TODO"),
  type: taskTypeEnum("type").notNull().default("TASK"),
  priority: priorityEnum("priority").notNull().default("MEDIUM"),
  assigneeId: text("assigneeId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  due_date: timestamp("due_date").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// ---------- Comment ----------
export const comments = pgTable("Comment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  taskId: text("taskId")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// ---------- Relations (mirrors Prisma's implicit relations) ----------
export const usersRelations = relations(users, ({ many }) => ({
  workspaceMemberships: many(workspaceMembers),
  ownedWorkspaces: many(workspaces),
  ledProjects: many(projects),
  assignedTasks: many(tasks),
  comments: many(comments),
  projectMemberships: many(projectMembers),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.ownerId], references: [users.id] }),
  members: many(workspaceMembers),
  projects: many(projects),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  user: one(users, { fields: [workspaceMembers.userId], references: [users.id] }),
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, { fields: [projects.team_lead], references: [users.id] }),
  workspace: one(workspaces, { fields: [projects.workspaceId], references: [workspaces.id] }),
  members: many(projectMembers),
  tasks: many(tasks),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  user: one(users, { fields: [projectMembers.userId], references: [users.id] }),
  project: one(projects, { fields: [projectMembers.projectId], references: [projects.id] }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  assignee: one(users, { fields: [tasks.assigneeId], references: [users.id] }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  task: one(tasks, { fields: [comments.taskId], references: [tasks.id] }),
}));
