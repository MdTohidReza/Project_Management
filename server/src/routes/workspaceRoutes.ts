import { Elysia, t } from "elysia";
import { authPlugin } from "../middleware/authMiddleware";
import { getUserWorkspaces, addMember } from "../controller/workspaceController";

export const workspaceRouter = new Elysia({ prefix: "/api/workspaces" })
  .use(authPlugin)

  // GET /api/workspaces
  .get("/", async ({ userId, set }) => {
    try {
      const workspaces = await getUserWorkspaces(userId);
      return { workspaces };
    } catch (error) {
      console.log(error);
      set.status = 500;
      return { message: (error as Error).message };
    }
  })

  // POST /api/workspaces/add-member
  .post(
    "/add-member",
    async ({ userId, body, set }) => {
      try {
        const result = await addMember({ userId, ...body });
        set.status = result.status;
        return result.body;
      } catch (error) {
        console.log(error);
        set.status = 500;
        return { message: (error as Error).message };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        role: t.String(),
        workspaceId: t.String(),
        message: t.Optional(t.String()),
      }),
    }
  );