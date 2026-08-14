import { Elysia, t } from "elysia";
import { authPlugin } from "../middleware/authMiddleware";
import { createTask, updateTask, deleteTask } from "../controller/taskController";

export const taskRouter = new Elysia({ prefix: "/api/tasks" })
  .use(authPlugin)

  // POST /api/tasks
  .post(
    "/",
    async ({ userId, body, request, set }) => {
      try {
        const origin = request.headers.get("origin") ?? "";
        const result = await createTask({ userId, origin, ...body });
        set.status = result.status;
        return result.body;
      } catch (error) {
        console.log(error);
        set.status = 500;
        return { message: (error as Error).message || "something went wrong" };
      }
    },
    {
      body: t.Object({
        projectId: t.String(),
        title: t.String(),
        description: t.Optional(t.String()),
        status: t.Optional(t.String()),
        priority: t.Optional(t.String()),
        assigneeId: t.Optional(t.String()),
        due_date: t.String(),
        type: t.Optional(t.String()),
      }),
    }
  )

  // PUT /api/tasks/:id
  .put(
    "/:id",
    async ({ userId, params, body, set }) => {
      try {
        const result = await updateTask({ userId, taskId: params.id, data: body });
        set.status = result.status;
        return result.body;
      } catch (error) {
        console.log(error);
        set.status = 500;
        return { message: (error as Error).message || "something went wrong" };
      }
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        status: t.Optional(t.String()),
        priority: t.Optional(t.String()),
        assigneeId: t.Optional(t.String()),
        due_date: t.Optional(t.String()),
        type: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/tasks/delete
  .post(
    "/delete",
    async ({ userId, body, set }) => {
      try {
        const result = await deleteTask({ userId, taskIds: body.taskIds });
        set.status = result.status;
        return result.body;
      } catch (error) {
        console.log(error);
        set.status = 500;
        return { message: (error as Error).message || "something went wrong" };
      }
    },
    {
      body: t.Object({
        taskIds: t.Array(t.String()),
      }),
    }
  );