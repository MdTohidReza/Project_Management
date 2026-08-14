import { db } from "../db";
import { tasks, projects } from "../db/schema";
import { eq, inArray } from "drizzle-orm";
import { inngest } from "../inngest/client";

// Create task
export async function createTask(input: {
  userId: string;
  origin: string;
  projectId: string;
  title: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assigneeId?: string;
  due_date: string;
  type?: "TASK" | "BUG" | "FEATURE" | "IMPROVEMENT" | "OTHER";
}) {
  const { userId, origin, projectId, title, description, status, priority, assigneeId, due_date, type } = input;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: { members: { with: { user: true } } },
  });

  if (!project) {
    return { status: 404, body: { message: "project not found" } };
  }
  if (project.team_lead !== userId) {
    return { status: 403, body: { message: "You don't have admin privilieges for this project" } };
  }
  if (assigneeId && !project.members.find((member) => member.userId === assigneeId)) {
    return { status: 403, body: { message: "assignee is not a member of this project/workspace" } };
  }

  const [task] = await db
    .insert(tasks)
    .values({
      projectId,
      title,
      description,
      priority,
      status,
      assigneeId: assigneeId!,
      type,
      due_date: new Date(due_date),
    })
    .returning();

  const taskWithAssignee = await db.query.tasks.findFirst({
    where: eq(tasks.id, task.id),
    with: { assignee: true },
  });

  await inngest.send({
    name: "app/task.assigned",
    data: { taskId: task.id, origin },
  });

  return { status: 200, body: { message: "task created successfully", task: taskWithAssignee } };
}

// Update task
export async function updateTask(input: {
  userId: string;
  taskId: string;
  data: Partial<typeof tasks.$inferInsert>;
}) {
  const { userId, taskId, data } = input;

  const task = await db.query.tasks.findFirst({ where: eq(tasks.id, taskId) });
  if (!task) {
    return { status: 404, body: { message: "Task not found" } };
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, task.projectId),
    with: { members: { with: { user: true } } },
  });
  if (!project) {
    return { status: 404, body: { message: "project not found" } };
  }
  if (project.team_lead !== userId) {
    return { status: 403, body: { message: "You don't have admin privilieges for this project" } };
  }

  const [updatedTask] = await db
    .update(tasks)
    .set(data)
    .where(eq(tasks.id, taskId))
    .returning();

  return { status: 200, body: { message: "Task updated successfully", task: updatedTask } };
}

// Delete task(s)
export async function deleteTask(input: { userId: string; taskIds: string[] }) {
  const { userId, taskIds } = input;

  const taskList = await db.query.tasks.findMany({ where: inArray(tasks.id, taskIds) });
  if (taskList.length === 0) {
    return { status: 404, body: { message: "Task not found" } };
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, taskList[0].projectId),
    with: { members: { with: { user: true } } },
  });
  if (!project) {
    return { status: 404, body: { message: "project not found" } };
  }
  if (project.team_lead !== userId) {
    return { status: 403, body: { message: "You don't have admin privilieges for this project" } };
  }

  await db.delete(tasks).where(inArray(tasks.id, taskIds));

  return { status: 200, body: { message: "Task(s) deleted successfully" } };
}