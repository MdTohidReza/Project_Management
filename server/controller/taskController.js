import { prisma } from "../src/db.js";
import { inngest } from '../src/inngest/index.js';

//create task
export const createTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      projectId,
      title,
      description,
      status,
      priority,
      start_date,
      end_date,
      assigneeId,
      due_date,
      type,
    } = req.body;
    const origin = req.get("origin");

    //check if user has admin for project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { include: { user: true } } },
    });
    if (!project) {
      return res.status(404).json({ message: "project not found" });
    } else if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have admin privilieges for this project" });
    } else if (
      assigneeId &&
      !project.members.find((member) => member.user.id === assigneeId)
    ) {
      return res
        .status(403)
        .json({
          message: "assignee is not a member of this project/workspace",
        });
    }
    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        priority,
        status,
        assigneeId,
        type,
        due_date: new Date(due_date),
      },
    });
    const taskWithAssignee = await prisma.task.findUnique({
      where: { id: task.id },
      include: { assignee: true },
    });

    await inngest.send({
      name:"app/task.assigned",
      data:{
        taskId:task.id, origin
      }
    })
    res.json({ message: "task created successfully", task: taskWithAssignee });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: error.code || error.message || "something went wrong" });
  }
};

//update task
export const updateTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const { userId } = await req.auth();
    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      include: { members: { include: { user: true } } },
    });
    if (!project) {
      return res.status(404).json({ message: "project not found" });
    } else if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have admin privilieges for this project" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: error.code || error.message || "something went wrong" });
  }
};

//Delete Task
export const deleteTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { taskIds } = req.body;
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
    });
    if (tasks.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    const project = await prisma.project.findUnique({
      where: { id: tasks[0].projectId },
      include: { members: { include: { user: true } } },
    });
    if (!project) {
      return res.status(404).json({ message: "project not found" });
    } else if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have admin privilieges for this project" });
    }
    await prisma.task.deleteMany({
      where: { id: { in: taskIds } },
    });
    res.json({ message: "Task(s) deleted successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: error.code || error.message || "something went wrong" });
  }
};
