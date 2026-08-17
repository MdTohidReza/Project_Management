import { db } from "../db";
import { workspaces, workspaceMembers, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { createClerkClient } from "@clerk/backend";

// Get all workspaces of a user
export async function getUserWorkspaces(userId: string) {
  const memberships = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, userId),
    with: {
      workspace: {
        with: {
          members: { with: { user: true } },
          projects: {
            with: {
              tasks: {
                with: {
                  assignee: true,
                  comments: { with: { user: true } },
                },
              },
              members: { with: { user: true } },
            },
          },
          owner: true,
        },
      },
    },
  });

  return memberships.map((m) => m.workspace);
}

// Add member to workspace
export async function addMember(input: {
  userId: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  workspaceId: string;
  message?: string;
}) {
  const { userId, email, role, workspaceId, message } = input;

  // check if user exists
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) {
    return { status: 404, body: { message: "User not found" } };
  }

  if (!workspaceId || !role) {
    return { status: 400, body: { message: "Missing Required Parameter" } };
  }

  if (!["ADMIN", "MEMBER"].includes(role)) {
    return { status: 400, body: { message: "Invalid Role" } };
  }

  // fetch workspace
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
    with: { members: true },
  });
  if (!workspace) {
    return { status: 404, body: { message: "Workspace not found" } };
  }

  // check if requesting user is admin of workspace
  const isAdmin = workspace.members.find(
    (member) => member.userId === userId && member.role === "ADMIN"
  );
  if (!isAdmin) {
    return {
      status: 403,
      body: { message: "You are not an admin of this workspace" },
    };
  }

  // check if user is already a member
  const existingMember = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.userId, user.id),
      eq(workspaceMembers.workspaceId, workspaceId)
    ),
  });
  if (existingMember) {
    return {
      status: 400,
      body: { message: "User is already a member of this workspace" },
    };
  }

  const [member] = await db
    .insert(workspaceMembers)
    .values({
      userId: user.id,
      workspaceId,
      role,
      message: message ?? "",
    })
    .returning();

  return { status: 200, body: { member, message: "Member added successfully" } };
}


//delete workspace
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function deleteWorkspaceById(userId: string, workspaceId: string) {
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
    with: { members: true },
  });
  if (!workspace) {
    return { status: 404, body: { message: "Workspace not found" } };
  }

  const isAdmin = workspace.members.find(
    (member) => member.userId === userId && member.role === "ADMIN"
  );
  if (!isAdmin) {
    return { status: 403, body: { message: "You are not an admin of this workspace" } };
  }

  // Deletes on Clerk's side — this fires the "organization.deleted" webhook,
  // which your existing syncWorkspaceDeletion Inngest function picks up
  // to automatically remove the row from Neon.
  await clerkClient.organizations.deleteOrganization(workspaceId);

  return { status: 200, body: { message: "Workspace deleted successfully" } };
}