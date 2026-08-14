import { db } from "../db";
import { workspaces, projects, projectMembers, users } from "../db/schema";
import { eq } from "drizzle-orm";

// Create project
export async function createProject(input: {
  userId: string;
  workspaceId: string;
  description?: string;
  name: string;
  status?: "ACTIVE" | "PLANNING" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
  start_date?: string;
  end_date?: string;
  team_members: string[]; // emails
  team_lead: string; // email
  progress?: number;
  priority?: "LOW" | "MEDIUM" | "HIGH";
}) {
  const { userId, workspaceId, description, name, status, start_date, end_date, team_members, team_lead, progress, priority } = input;

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
    with: { members: { with: { user: true } } },
  });
  if (!workspace) {
    return { status: 404, body: { message: "Workspace not found" } };
  }

  const isAdmin = workspace.members.some(
    (member) => member.userId === userId && member.role === "ADMIN"
  );
  if (!isAdmin) {
    return { status: 403, body: { message: "You don't have permission to create project in this workspace" } };
  }

  const teamLeadUser = await db.query.users.findFirst({
    where: eq(users.email, team_lead),
    columns: { id: true },
  });

  const [project] = await db
    .insert(projects)
    .values({
      workspaceId,
      description,
      name,
      status,
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
      progress,
      priority,
      team_lead: teamLeadUser?.id!,
    })
    .returning();

  if (team_members.length > 0) {
    const membersToAdd = workspace.members
      .filter((member) => team_members.includes(member.user.email))
      .map((member) => member.user.id);

    if (membersToAdd.length > 0) {
      await db.insert(projectMembers).values(
        membersToAdd.map((memberId) => ({
          projectId: project.id,
          userId: memberId,
        }))
      );
    }
  }

  const projectWithMembers = await db.query.projects.findFirst({
    where: eq(projects.id, project.id),
    with: {
      members: { with: { user: true } },
      tasks: { with: { assignee: true, comments: { with: { user: true } } } },
      owner: true,
    },
  });

  return { status: 200, body: { project: projectWithMembers, message: "Project created successfully" } };
}

// Update project
export async function updateProject(input: {
  userId: string;
  id: string;
  workspaceId: string;
  description?: string;
  name?: string;
  status?: "ACTIVE" | "PLANNING" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
  start_date?: string;
  end_date?: string;
  progress?: number;
  priority?: "LOW" | "MEDIUM" | "HIGH";
}) {
  const { userId, id, workspaceId, description, name, status, start_date, end_date, progress, priority } = input;

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
    with: { members: { with: { user: true } } },
  });
  if (!workspace) {
    return { status: 404, body: { message: "Workspace not found" } };
  }

  // NOTE: fixed from `member.id === userId` (bug — compares a UUID to a Clerk user ID)
  // to `member.userId === userId`, matching the same fix applied in workspaceController
  const isAdmin = workspace.members.some(
    (member) => member.userId === userId && member.role === "ADMIN"
  );

  if (!isAdmin) {
    const project = await db.query.projects.findFirst({ where: eq(projects.id, id) });
    if (!project) {
      return { status: 404, body: { message: "Project not found" } };
    }
    if (project.team_lead !== userId) {
      return { status: 403, body: { message: "You don't have permission to update  project in this workspace" } };
    }
  }

  const [project] = await db
    .update(projects)
    .set({
      name,
      workspaceId,
      description,
      status,
      priority,
      progress,
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
    })
    .where(eq(projects.id, id))
    .returning();

  return { status: 200, body: { project, message: "Project updated successfully" } };
}

// Add member to project
export async function addProjectMember(input: {
  userId: string;
  projectId: string;
  email: string;
}) {
  const { userId, projectId, email } = input;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: { members: { with: { user: true } } },
  });
  if (!project) {
    return { status: 404, body: { message: "Project not found" } };
  }
  if (project.team_lead !== userId) {
    return { status: 404, body: { message: "Only project lead can add Member" } };
  }

  // NOTE: fixed from `member.email` (bug — ProjectMember has no `.email` field,
  // the email lives on the nested `.user` object) to `member.user.email`
  const existingMember = project.members.find((member) => member.user.email === email);
  if (existingMember) {
    return { status: 400, body: { message: "User is already a member of this project" } };
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) {
    return { status: 404, body: { message: "User not found" } };
  }

  const [member] = await db
    .insert(projectMembers)
    .values({ userId: user.id, projectId: project.id })
    .returning();

  return { status: 200, body: { member, message: "Member added successfully" } };
}