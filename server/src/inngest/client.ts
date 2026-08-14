import { Inngest } from "inngest";
import { db } from "../db";
import { users, workspaces, workspaceMembers, tasks } from "../db/schema";
import { eq } from "drizzle-orm";
import sendEmail from "../lib/mailer";
;

// Create a client to send and receive events
export const inngest = new Inngest({ id: "Project-Management" });


// Inngest function to save user data to database
const SyncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: { event: "clerk/user.created" },
  },
  async ({ event }) => {
    const { data } = event;
    await db.insert(users).values({
      id: data.id,
      email: data?.email_addresses[0]?.email_address,
      name: data?.first_name + " " + data?.last_name,
      image: data?.image_url,
    });
  }
);

// Inngest function to update user in database
const SyncUserUpdate = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: { event: "clerk/user.updated" },
  },
  async ({ event }) => {
    const { data } = event;
    await db
      .update(users)
      .set({
        email: data?.email_addresses[0]?.email_address,
        name: data?.first_name + " " + data?.last_name,
        image: data?.image_url,
      })
      .where(eq(users.id, data.id));
  }
);

// Inngest function to delete user from database
const SyncUserDelete = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: { event: "clerk/user.deleted" },
  },
  async ({ event }) => {
    const { data } = event;
    await db.delete(users).where(eq(users.id, data.id));
  }
);

// Inngest function to save workspace data to the database
const syncWorkspaceCreation = inngest.createFunction(
  {
    id: "sync-workspace-from-clerk",
    triggers: { event: "clerk/organization.created" },
  },
  async ({ event }) => {
    const { data } = event;

    await db
      .insert(workspaces)
      .values({
        id: data.id,
        name: data.name,
        slug: data.slug,
        ownerId: data.created_by,
        image_url: data.image_url,
      })
      .onConflictDoUpdate({
        target: workspaces.id,
        set: {
          name: data.name,
          slug: data.slug,
          image_url: data.image_url,
        },
      });

    // Add creator as Admin Member (idempotent, matches unique constraint on userId+workspaceId)
    await db
      .insert(workspaceMembers)
      .values({
        userId: data.created_by,
        workspaceId: data.id,
        role: "ADMIN",
      })
      .onConflictDoNothing();
  }
);

// Inngest function to update workspace data in database
const syncWorkspaceUpdation = inngest.createFunction(
  {
    id: "update-workspace-from-clerk",
    triggers: { event: "clerk/organization.updated" },
  },
  async ({ event }) => {
    const { data } = event;
    await db
      .update(workspaces)
      .set({
        name: data.name,
        slug: data.slug,
        image_url: data.image_url,
      })
      .where(eq(workspaces.id, data.id));
  }
);

// Inngest function to delete workspace from database
const syncWorkspaceDeletion = inngest.createFunction(
  {
    id: "delete-workspace-from-clerk",
    triggers: { event: "clerk/organization.deleted" },
  },
  async ({ event }) => {
    const { data } = event;
    await db.delete(workspaces).where(eq(workspaces.id, data.id));
  }
);

// Inngest function to save workspace member data to database
const syncWorkspaceMemberCreation = inngest.createFunction(
  {
    id: "sync-workspace-member-from-clerk",
    triggers: { event: "clerk/organizationInvitation.accepted" },
  },
  async ({ event }) => {
    const { data } = event;
    await db.insert(workspaceMembers).values({
      userId: data.user_id,
      workspaceId: data.organization_id,
      role: String(data.role_name).toUpperCase() as "ADMIN" | "MEMBER",
    });
  }
);

// Inngest function to send email on task creation
const sendTaskAssignmentEmail = inngest.createFunction(
  {
    id: "send-task-assignment-email",
    triggers: { event: "app/task.assigned" },
  },
  async ({ event, step }) => {
    const { taskId, origin } = event.data;

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: { assignee: true, project: true },
    });

    if (!task) return;

    const taskUrl = `${origin}/project/${task.projectId}/task/${task.id}`;
    const dueDate = new Date(task.due_date).toDateString();

    await sendEmail({
      to: task.assignee.email,
      subject: `New Task Assignment in ${task.project.name}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f9fafb; border-radius: 8px;">
          <h2 style="color: #1f2937; margin-bottom: 4px;">New Task Assigned</h2>
          <p style="color: #6b7280; margin-top: 0;">You've been assigned a new task in <strong>${task.project.name}</strong>.</p>

          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Task:</strong> ${task.title}</p>
            <p style="margin: 0 0 8px 0;"><strong>Description:</strong> ${task.description || "No description provided"}</p>
            <p style="margin: 0;"><strong>Due Date:</strong> ${dueDate}</p>
          </div>

          <a href="${taskUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 500;">
            View Task
          </a>

          <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">
            Please review the task details and complete it before the due date. If you have any questions, reach out to your project lead.
          </p>
        </div>
      `,
    });

    if (new Date(task.due_date).toDateString() !== new Date().toDateString()) {
      await step.sleepUntil("wait-for-the-due-date", new Date(task.due_date));

      await step.run("check-if-task-is-completed", async () => {
        const latestTask = await db.query.tasks.findFirst({
          where: eq(tasks.id, taskId),
          with: { assignee: true, project: true },
        });

        if (!latestTask) return;

        if (latestTask.status !== "DONE") {
          await step.run("send-reminder-email", async () => {
            await sendEmail({
              to: latestTask.assignee.email,
              subject: `Reminder: Task "${latestTask.title}" is due today`,
              body: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f9fafb; border-radius: 8px;">
                  <h2 style="color: #1f2937; margin-bottom: 4px;">
                    Reminder: Task Due Today
                  </h2>
                  <p style="color: #6b7280; margin-top: 0;">
                    You've been assigned a task in <strong>${latestTask.project.name}</strong>.
                  </p>

                  <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0 0 8px 0;">
                      <strong>Task:</strong> ${latestTask.title}
                    </p>
                    <p style="margin: 0 0 8px 0;">
                      <strong>Description:</strong> ${latestTask.description || "No description provided"}
                    </p>
                    <p style="margin: 0;">
                      <strong>Due Date:</strong> ${dueDate}
                    </p>
                  </div>

                  <a href="${taskUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 500;">
                    View Task
                  </a>

                  <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">
                    Please review the task details and complete it as soon as possible. If you have any questions, reach out to your project lead.
                  </p>
                </div>
              `,
            });
          });
        }
      });
    }
  }
);

export const functions = [
  SyncUserCreation,
  SyncUserUpdate,
  SyncUserDelete,
  syncWorkspaceCreation,
  syncWorkspaceUpdation,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation,
  sendTaskAssignmentEmail,
];