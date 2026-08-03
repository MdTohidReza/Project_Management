import { prisma } from "../src/db.js";

//Get all workspaces of a user
export const getUserWorkspaces = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: { some: { userId: userId } },
      },
      include: {
        members: { include: { user: true } },
        projects: {
          include: {
            tasks: {
              include: {
                assignee: true,
                comments: { include: { user: true } },
              },
            },
            members: { include: { user: true } },
          },
        },
        owner: true,
      },
    });
    res.json({ workspaces });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// add member to workspace
export const addMember = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { email, role, workspaceId, message } = req.body;

    //check if user exist
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!workspaceId || !role) {
      return res.status(400).json({ message: "Missing Required Parameter" });
    }
    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({ message: "Invalid Role" });
    }
    //fetch workspace
    const workaspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });
    if (!workaspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    //check if user is admin of workspace
    if (
      !workaspace.members.find(
        (member) => member.userId === userId && member.role === "ADMIN",
      )
    ) {
      return res
        .status(403)
        .json({ message: "You are not an admin of this workspace" });
    }
    //check if user is already a member
    const existingMember = await prisma.workspaceMember.find(
      (member) => member.userId === userId,
    );
    if (existingMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this workspace" });
    }
    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role,
        message,
      },
    });
    res.json({ member, message: "Member added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ member, message: error.code || error.message });
  }
};
