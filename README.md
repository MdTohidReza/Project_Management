# 📊 Project Management Platform

> An open-source, full-stack project management platform designed to help teams collaborate, organize tasks, and track project progress efficiently.

<div align="center">

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Bun-Latest-F471F5?style=for-the-badge&logo=bun)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)


[![GitHub Issues](https://img.shields.io/badge/Issues-open-blue.svg?style=for-the-badge)](https://github.com/MdTohidReza/Project_Management/issues)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Project Structure](#️-project-structure)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Project](#running-the-project)
- [📁 Folder Structure](#-folder-structure)
- [🔌 API Endpoints](#-api-endpoints)
- [🗄️ Database](#️-database)
- [🔐 Authentication](#-authentication)

---

## ✨ Features

### Core Functionality

- **👥 Multiple Workspaces** - Create and manage multiple independent workspaces with their own projects and teams
- **📁 Project Management** - Create, organize, and manage projects with detailed information
- **✅ Task Management** - Create tasks, assign to team members, set due dates, and track progress
- **👨‍💼 Team Collaboration** - Invite team members, manage roles, and collaborate seamlessly
- **💬 Comments & Communication** - Add comments to tasks and projects for team discussion
- **📊 Analytics & Reporting** - View project analytics, progress tracking, and team performance
- **📅 Calendar View** - Visualize tasks and deadlines in a calendar interface
- **🎯 Task Summaries** - Get quick overview of all tasks and their statuses
- **🔔 Recent Activity** - Track all recent activities across projects
- **🌓 Dark/Light Theme** - Toggle between dark and light themes for comfortable viewing

---

## 🏗️ Project Structure

This is a **monorepo** containing both frontend and backend applications:

```
project-management-fresh/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── features/      # Redux slices
│   │   ├── app/           # Redux store configuration
│   │   ├── configs/       # Configuration files
│   │   ├── lib/           # Utility functions
│   │   ├── types/         # TypeScript type definitions
│   │   ├── assets/        # Static assets
│   │   └── App.tsx        # Main App component
│   ├── index.html         # HTML entry point
│   ├── package.json       # Frontend dependencies
│   ├── tsconfig.json      # TypeScript configuration
│   ├── vite.config.ts     # Vite configuration
│   └── eslint.config.js   # ESLint configuration
│
├── server/                 # Backend Bun/Elysia application
│   ├── src/
│   │   ├── controller/    # Request handlers
│   │   ├── routes/        # API route definitions
│   │   ├── db/            # Database schema and queries
│   │   ├── middleware/    # Custom middleware
│   │   ├── inngest/       # Background job client
│   │   ├── lib/           # Utility functions (mailer, etc.)
│   │   └── index.ts       # Server entry point
│   ├── drizzle.config.ts  # Drizzle ORM configuration
│   ├── package.json       # Backend dependencies
│   └── tsconfig.json      # TypeScript configuration
│
├── README.md              # This file
```

---

## 🛠️ Tech Stack

### Frontend (Client)

| Technology          | Purpose            | Version |
| ------------------- | ------------------ | ------- |
| **React**           | UI Framework       | 19.1.1  |
| **TypeScript**      | Type Safety        | 7.0.2   |
| **Vite**            | Build Tool         | 7.1.2   |
| **Tailwind CSS**    | Styling            | 4.1.12  |
| **Redux Toolkit**   | State Management   | 2.8.2   |
| **React Router**    | Routing            | 7.8.1   |
| **Axios**           | HTTP Client        | 1.19.0  |
| **Clerk**           | Authentication     | 5.61.9  |
| **Recharts**        | Data Visualization | 3.1.2   |
| **Lucide React**    | Icons              | 0.540.0 |
| **React Hot Toast** | Notifications      | 2.6.0   |
| **date-fns**        | Date Utilities     | 4.1.0   |

### Backend (Server)

| Technology      | Purpose                   | Version    |
| --------------- | ------------------------- | ---------- |
| **Bun**         | JavaScript Runtime        | Latest     |
| **Elysia**      | Web Framework             | 1.4.29     |
| **TypeScript**  | Type Safety               | 5+         |
| **Drizzle ORM** | Object-Relational Mapping | 0.45.2     |
| **PostgreSQL**  | Database                  | (via Neon) |
| **Clerk**       | Authentication            | 3.16.4     |
| **Inngest**     | Background Jobs           | 4.18.0     |
| **Nodemailer**  | Email Service             | 9.0.5      |
| **CORS**        | Cross-Origin Support      | 1.4.2      |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18+) or **Bun** (Latest)
- **Git**
- **npm** or **bun** package manager
- PostgreSQL database (or Neon account for serverless)
- Clerk account for authentication

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/MdTohidReza/Project_Management.git
cd project-management-fresh
```

#### 2. Install Frontend Dependencies

```bash
cd client
npm install
# or
bun install
```

#### 3. Install Backend Dependencies

```bash
cd ../server
npm install
# or
bun install
```

#### 4. Setup Environment Variables

**Frontend (.env.local in `client/`):**

```env
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

**Backend (.env in `server/`):**

```env
DATABASE_URL=your_postgresql_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Running the Project

#### Development Mode

**Terminal 1 - Start Backend Server:**

```bash
cd server
bun run dev
# Server runs on http://localhost:3000
```

**Terminal 2 - Start Frontend Development Server:**

```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

#### Production Build

**Frontend:**

```bash
cd client
npm run build
npm run preview
```

**Backend:**

```bash
cd server
bun run start
```

---

## 📁 Folder Structure Details

### Client (`client/src/`)

- **components/** - Reusable UI components
  - `CreateProjectDialog.tsx` - Create new projects
  - `CreateTaskDialog.tsx` - Create new tasks
  - `ProjectAnalytics.tsx` - Analytics dashboard
  - `ProjectCalendar.tsx` - Calendar view
  - `Navbar.tsx` - Navigation bar
  - `Sidebar.tsx` - Main sidebar navigation
  - And more...

- **pages/** - Full-page components
  - `Dashboard.tsx` - Main dashboard
  - `Projects.tsx` - Projects listing
  - `ProjectDetails.tsx` - Single project view
  - `Team.tsx` - Team management
  - `TaskDetails.tsx` - Task details page

- **features/** - Redux slices
  - `workspaceSlice.ts` - Workspace state management
  - `themeSlice.ts` - Theme state management

- **app/** - Redux store setup
  - `store.ts` - Redux store configuration
  - `hooks.ts` - Custom Redux hooks

- **types/** - TypeScript definitions
  - `index.ts` - All type definitions

- **configs/** - Application configuration
  - `api.ts` - API endpoint configuration

- **lib/** - Utility functions
  - `getErrorMessage.ts` - Error handling utilities

### Server (`server/src/`)

- **controller/** - Request handlers
  - `projectController.ts` - Project operations
  - `taskController.ts` - Task operations
  - `workspaceController.ts` - Workspace operations
  - `commentController.ts` - Comment operations

- **routes/** - API route definitions
  - `projectRoutes.ts` - Project routes
  - `taskRoutes.ts` - Task routes
  - `workspaceRoutes.ts` - Workspace routes
  - `commentRoutes.ts` - Comment routes

- **db/** - Database layer
  - `schema.ts` - Database schema definitions
  - `index.ts` - Database client and queries

- **middleware/** - Express middleware
  - `authMiddleware.ts` - Authentication middleware

- **lib/** - Utility functions
  - `mailer.ts` - Email sending functionality

- **inngest/** - Background jobs
  - `client.ts` - Inngest client configuration

---

## 🔌 API Endpoints

### Projects

- `GET /projects` - Get all projects
- `POST /projects` - Create a new project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Tasks

- `GET /tasks` - Get all tasks
- `POST /tasks` - Create a new task
- `GET /tasks/:id` - Get task details
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Workspaces

- `GET /workspaces` - Get all workspaces
- `POST /workspaces` - Create a new workspace
- `GET /workspaces/:id` - Get workspace details
- `PUT /workspaces/:id` - Update workspace
- `DELETE /workspaces/:id` - Delete workspace

### Comments

- `GET /comments` - Get all comments
- `POST /comments` - Create a comment
- `DELETE /comments/:id` - Delete comment

---

## 🗄️ Database

The project uses **PostgreSQL** with **Drizzle ORM** for database management.

### Database Commands

```bash
# Generate migration files
bun run db:generate

# Run migrations
bun run db:migrate

# Open Drizzle Studio (visual database explorer)
bun run db:studio

# Seed the database
bun run db:seed
```

---

## 🔐 Authentication

This project uses **Clerk** for secure authentication and user management. Clerk handles:

- User sign-up and sign-in
- Social authentication
- Multi-factor authentication
- User session management
- Webhook support

---

## 🤝 Contributing

We welcome contributions from the community! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For detailed contribution guidelines, please see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE.md](./LICENSE.md) file for details.

---

## 🙏 Acknowledgments

- React team for the amazing UI framework
- Bun team for the fast JavaScript runtime
- Clerk for authentication services
- Tailwind CSS for utility-first styling
- Drizzle ORM for elegant database management
- The open-source community for inspiration and support

---

<div align="center">

**[Back to Top](#-project-management-platform)**

Made with ❤️ by the Project Management Team

</div>
