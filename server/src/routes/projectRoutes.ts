import { Elysia, t } from "elysia";
import { authPlugin } from "../middleware/authMiddleware";
import { createProject, updateProject, addProjectMember } from "../controller/projectController";

export const projectRouter = new Elysia({ prefix: "/api/projects" })
  .use(authPlugin)

  // POST /api/projects
  .post(
    "/",
    async ({ userId, body, set }) => {
      try {
        const result = await createProject({ userId, ...body });
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
        workspaceId: t.String(),
        description: t.Optional(t.String()),
        name: t.String(),
        status: t.Optional(t.String()),
        start_date: t.Optional(t.String()),
        end_date: t.Optional(t.String()),
        team_members: t.Array(t.String()),
        team_lead: t.String(),
        progress: t.Optional(t.Number()),
        priority: t.Optional(t.String()),
      }),
    }
  )

  // PUT /api/projects
  .put(
    "/",
    async ({ userId, body, set }) => {
      try {
        const result = await updateProject({ userId, ...body });
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
        id: t.String(),
        workspaceId: t.String(),
        description: t.Optional(t.String()),
        name: t.Optional(t.String()),
        status: t.Optional(t.String()),
        start_date: t.Optional(t.String()),
        end_date: t.Optional(t.String()),
        progress: t.Optional(t.Number()),
        priority: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/projects/:projectId/addMember
  .post(
    "/:projectId/addMember",
    async ({ userId, params, body, set }) => {
      try {
        const result = await addProjectMember({
          userId,
          projectId: params.projectId,
          email: body.email,
        });
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
        email: t.String(),
      }),
    }
  );