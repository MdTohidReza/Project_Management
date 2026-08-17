import { MoonIcon, PanelLeft, SearchIcon, SunIcon, FolderIcon, CheckSquareIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from "../app/hooks"
import { toggleTheme } from '../features/themeSlice';
import { UserButton } from "@clerk/clerk-react";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ setIsSidebarOpen}: { setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const dispatch = useAppDispatch();
    const { theme } = useSelector(state => state.theme);
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);

    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q || !currentWorkspace?.projects) return { projects: [], tasks: [] };

        const matchedProjects = currentWorkspace.projects.filter((p) =>
            p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
        );

        const matchedTasks = currentWorkspace.projects.flatMap((p) =>
            (p.tasks || [])
                .filter((t) => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
                .map((t) => ({ ...t, projectId: p.id, projectName: p.name }))
        );

        return { projects: matchedProjects.slice(0, 5), tasks: matchedTasks.slice(0, 5) };
    }, [query, currentWorkspace]);

    const hasResults = results.projects.length > 0 || results.tasks.length > 0;

   const handleSelectProject = (projectId: string) => {
    navigate(`/projectsDetail?id=${projectId}&tab=tasks`);
    setQuery("");
    setIsOpen(false);
};

    const handleSelectTask = (projectId: string, taskId: string) => {
    navigate(`/taskDetails?projectId=${projectId}&taskId=${taskId}`);
    setQuery("");
    setIsOpen(false);
};

    return (
      <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 xl:px-16 py-3 flex-shrink-0">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Left section */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Sidebar Trigger */}
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="sm:hidden p-2 rounded-lg transition-colors text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <PanelLeft size={20} />
            </button>

            {/* Search Input */}
            <div className="relative flex-1 max-w-sm" ref={searchRef}>
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => query && setIsOpen(true)}
                placeholder="Search projects, tasks..."
                className="pl-8 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
              />

              {isOpen && query.trim() && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-80 overflow-y-auto">
                  {!hasResults && (
                    <p className="text-sm text-gray-500 dark:text-zinc-400 px-3 py-3">No results found</p>
                  )}

                  {results.projects.length > 0 && (
                    <div className="py-1">
                      <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-wider px-3 py-1">Projects</p>
                      {results.projects.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProject(p.id)}
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800"
                        >
                          <FolderIcon className="size-4 text-blue-500 flex-shrink-0" />
                          <span className="text-sm text-gray-800 dark:text-white truncate">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.tasks.length > 0 && (
                    <div className="py-1 border-t border-gray-100 dark:border-zinc-800">
                      <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-wider px-3 py-1">Tasks</p>
                      {results.tasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => handleSelectTask(t.projectId, t.id)}
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800"
                        >
                          <CheckSquareIcon className="size-4 text-green-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-800 dark:text-white truncate">{t.title}</p>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{t.projectName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg transition hover:scale-105 active:scale-95"
            >
              {theme === "light" ? (
                <MoonIcon className="size-4 text-gray-800 dark:text-gray-200" />
              ) : (
                <SunIcon className="size-4 text-yellow-400" />
              )}
            </button>

            {/* User Button */}
            <UserButton />
          </div>
        </div>
      </div>
    );
}

export default Navbar