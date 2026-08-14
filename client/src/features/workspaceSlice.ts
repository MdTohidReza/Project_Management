import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../configs/api";
import type { Workspace, Project, Task } from "../types";

interface FetchWorkspacesArgs {
  getToken: () => Promise<string | null>;
}

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetchWorkspaces",
  async ({ getToken }: FetchWorkspacesArgs) => {
    const token = await getToken();
    // console.log("TOKEN:", token);
    const { data } = await api.get("/api/workspaces", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data.workspaces;
  }
);

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
}

const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  loading: false,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
      state.workspaces = action.payload;
    },
    setCurrentWorkspace: (state, action: PayloadAction<string>) => {
      localStorage.setItem("currentWorkspaceId", action.payload);
      state.currentWorkspace = state.workspaces.find((w) => w.id === action.payload) ?? null;
    },
    addWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.workspaces.push(action.payload);
      if (state.currentWorkspace?.id !== action.payload.id) {
        state.currentWorkspace = action.payload;
      }
    },
    updateWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.workspaces = state.workspaces.map((w) => (w.id === action.payload.id ? action.payload : w));
      if (state.currentWorkspace?.id === action.payload.id) {
        state.currentWorkspace = action.payload;
      }
    },
    deleteWorkspace: (state, action: PayloadAction<string>) => {
      state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
    },
    addProject: (state, action: PayloadAction<Project>) => {
      if (!state.currentWorkspace) return;
      state.currentWorkspace.projects.push(action.payload);
      const wsId = state.currentWorkspace.id;
      state.workspaces = state.workspaces.map((w) =>
        w.id === wsId ? { ...w, projects: [...w.projects, action.payload] } : w
      );
    },
    addTask: (state, action: PayloadAction<Task>) => {
      if (!state.currentWorkspace) return;
      const wsId = state.currentWorkspace.id;
      state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
        if (p.id === action.payload.projectId) p.tasks.push(action.payload);
        return p;
      });
      state.workspaces = state.workspaces.map((w) =>
        w.id === wsId
          ? {
              ...w,
              projects: w.projects.map((p) =>
                p.id === action.payload.projectId ? { ...p, tasks: [...p.tasks, action.payload] } : p
              ),
            }
          : w
      );
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      if (!state.currentWorkspace) return;
      const wsId = state.currentWorkspace.id;
      state.currentWorkspace.projects.forEach((p) => {
        if (p.id === action.payload.projectId) {
          p.tasks = p.tasks.map((t) => (t.id === action.payload.id ? action.payload : t));
        }
      });
      state.workspaces = state.workspaces.map((w) =>
        w.id === wsId
          ? {
              ...w,
              projects: w.projects.map((p) =>
                p.id === action.payload.projectId
                  ? { ...p, tasks: p.tasks.map((t) => (t.id === action.payload.id ? action.payload : t)) }
                  : p
              ),
            }
          : w
      );
    },
    deleteTask: (state, action: PayloadAction<{ projectId: string; taskIds: string[] }>) => {
      if (!state.currentWorkspace) return;
      const wsId = state.currentWorkspace.id;
      state.currentWorkspace.projects.forEach((p) => {
        p.tasks = p.tasks.filter((t) => !action.payload.taskIds.includes(t.id));
      });
      state.workspaces = state.workspaces.map((w) =>
        w.id === wsId
          ? {
              ...w,
              projects: w.projects.map((p) =>
                p.id === action.payload.projectId
                  ? { ...p, tasks: p.tasks.filter((t) => !action.payload.taskIds.includes(t.id)) }
                  : p
              ),
            }
          : w
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWorkspaces.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchWorkspaces.fulfilled, (state, action) => {
      state.workspaces = action.payload;
      if (action.payload.length > 0) {
        const savedId = localStorage.getItem("currentWorkspaceId");
        const found = savedId ? action.payload.find((w) => w.id === savedId) : undefined;
        state.currentWorkspace = found ?? action.payload[0];
      }
      state.loading = false;
    });
    builder.addCase(fetchWorkspaces.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const {
  setWorkspaces, setCurrentWorkspace, addWorkspace, updateWorkspace,
  deleteWorkspace, addProject, addTask, updateTask, deleteTask,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;