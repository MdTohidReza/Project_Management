import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { serve } from "inngest/bun";
import { inngest, functions } from "./inngest/client";
import { workspaceRouter } from "./routes/workspaceRoutes";
import { projectRouter } from "./routes/projectRoutes";
import { taskRouter } from "./routes/taskRoutes";
import { commentRouter } from "./routes/commentRoutes";

// Inngest handler — wraps the standard fetch-based handler for Elysia's context
const handler = serve({
  client: inngest,
  functions,
});

const inngestHandler = new Elysia().all("/api/inngest", ({ request }) =>
  handler(request)
);

const app = new Elysia()
  .use(cors())
  .get("/", () => "server is live !")
  .use(inngestHandler)
  .use(workspaceRouter)
  .use(projectRouter)
  .use(taskRouter)
  .use(commentRouter)
  .listen(process.env.PORT ?? 5000);

console.log(`Server is running on PORT : ${app.server?.port}`);

export type App = typeof app;