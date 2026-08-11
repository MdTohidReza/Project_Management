import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./src/inngest/index.js"
import { protect } from './middleware/authMiddleware.js';
import workspaceRouter from './routes/workspaceRoute.js';
import projectRouter from './routes/projectRoutes.js';
import taskRouter from './routes/taskRoutes.js';
import commentRouter from './routes/commentRoutes.js';

const app = express()


app.use(express.json())
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://project-management-786.vercel.app",
    ],
  }),
);
app.use(clerkMiddleware());

app.get('/',(req,res)=>
    res.send('server is live !')
)

app.use("/api/inngest", serve({ client: inngest, functions }));

//Router
app.use('/api/workspaces',protect,workspaceRouter)
app.use('/api/projects',protect,projectRouter)
app.use('/api/task',protect,taskRouter)
app.use('/api/comment',protect,commentRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`Server is running on PORT : ${PORT}`)
})
