import { db } from "../db";
import { tasks, projects, comments } from "../db/schema";
import { eq } from "drizzle-orm";

// Add comment
export async function addComment(input: {
  userId: string;
  content: string;
  taskId: string;
}) {
  const { userId, content, taskId } = input;

  const task = await db.query.tasks.findFirst({ where: eq(tasks.id, taskId) });
  if (!task) {
    return { status: 404, body: { message: "Task not found" } };
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, task.projectId),
    with: { members: { with: { user: true } } },
  });
  if (!project) {
    return { status: 404, body: { message: "Project not found" } };
  }

  const member = project.members.find((member) => member.userId === userId);
  if (!member) {
    return { status: 403, body: { message: "Your are not the member of this projecy" } };
  }

  const [inserted] = await db
    .insert(comments)
    .values({ taskId, content, userId })
    .returning();

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, inserted.id),
    with: { user: true },
  });

  return { status: 200, body: { comment } };
}

// Get comments for a task
export async function getTaskComments(taskId: string) {
  const commentList = await db.query.comments.findMany({
    where: eq(comments.taskId, taskId),
    with: { user: true },
  });

  return { status: 200, body: { comments: commentList } };
}