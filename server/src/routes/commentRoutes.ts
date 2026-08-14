import { Elysia, t } from "elysia";
import { authPlugin } from "../middleware/authMiddleware";
import { addComment, getTaskComments } from "../controller/commentController";

export const commentRouter = new Elysia({ prefix: "/api/comments" })
  .use(authPlugin)

  // POST /api/comments
  .post(
    "/",
    async ({ userId, body, set }) => {
      try {
        const result = await addComment({ userId, ...body });
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
        content: t.String(),
        taskId: t.String(),
      }),
    }
  )

  // GET /api/comments/:taskId
  .get("/:taskId", async ({ params, set }) => {
    try {
      const result = await getTaskComments(params.taskId);
      set.status = result.status;
      return result.body;
    } catch (error) {
      console.log(error);
      set.status = 500;
      return { message: (error as Error).message || "something went wrong" };
    }
  });