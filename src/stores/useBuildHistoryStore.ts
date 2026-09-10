import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Build, ActiveProject, BuildStats, BuildHistoryState } from '../types';

const initialStats: BuildStats = {
  projectsCompleted: 24,
  projectsInProgress: 2,
  linesOfCode: 12456,
  totalTime: 2910, // 48h 30min
  weeklyActivity: [
    { day: 'Seg', hours: 6 },
    { day: 'Ter', hours: 8 },
    { day: 'Qua', hours: 4 },
    { day: 'Qui', hours: 9 },
    { day: 'Sex', hours: 6 },
    { day: 'Sab', hours: 2 },
    { day: 'Dom', hours: 0 },
  ],
};

const sampleBuilds: Build[] = [
  {
    id: 'build-1',
    projectId: 'doniq-app',
    projectName: 'doniq-app',
    task: 'Feature: CRM Connector',
    status: 'completed',
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    finishedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    duration: 32,
    progress: 100,
    tasks: [
      { id: 't1', title: 'Setup CRM API client', status: 'done' },
      { id: 't2', title: 'Implement connector class', status: 'done' },
      { id: 't3', title: 'Add error handling', status: 'done' },
      { id: 't4', title: 'Write unit tests', status: 'done' },
    ],
    filesChanged: ['src/services/crm-connector.ts', 'src/types/crm.ts', 'tests/crm.test.ts'],
    commits: [
      { id: 'c1', message: 'feat: add CRM connector', timestamp: new Date(), author: 'Dev Agent' },
      { id: 'c2', message: 'test: add connector tests', timestamp: new Date(), author: 'QA Agent' },
    ],
  },
  {
    id: 'build-2',
    projectId: 'command-center',
    projectName: 'command-center',
    task: 'Setup Dashboard Structure',
    status: 'completed',
    startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    finishedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
    duration: 28,
    progress: 100,
    tasks: [
      { id: 't1', title: 'Setup Vite + React', status: 'done' },
      { id: 't2', title: 'Config Tailwind', status: 'done' },
      { id: 't3', title: 'Sidebar with squads', status: 'done' },
      { id: 't4', title: 'Agent cards', status: 'done' },
    ],
    filesChanged: ['src/App.tsx', 'src/components/Sidebar.tsx', 'src/components/AgentCard.tsx', 'tailwind.config.js'],
    commits: [
      { id: 'c1', message: 'chore: initial project setup', timestamp: new Date(), author: 'Dev Agent' },
      { id: 'c2', message: 'feat: add sidebar component', timestamp: new Date(), author: 'Dev Agent' },
      { id: 'c3', message: 'feat: add agent cards', timestamp: new Date(), author: 'UX Agent' },
    ],
  },
  {
    id: 'build-3',
    projectId: 'doniq-rh',
    projectName: 'doniq-rh',
    task: 'Auth Setup',
    status: 'completed',
    startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    finishedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    duration: 35,
    progress: 100,
    tasks: [
      { id: 't1', title: 'Setup JWT auth', status: 'done' },
      { id: 't2', title: 'Implement login flow', status: 'done' },
      { id: 't3', title: 'Add password reset', status: 'done' },
    ],
    filesChanged: ['src/auth/jwt.ts', 'src/components/LoginForm.tsx'],
    commits: [
      { id: 'c1', message: 'feat: add JWT authentication', timestamp: new Date(), author: 'Dev Agent' },
    ],
  },
  {
    id: 'build-4',
    projectId: 'doniq-app',
    projectName: 'doniq-app',
    task: 'API Routes',
    status: 'completed',
    startedAt: new Date(Date.now() - 26 * 60 * 60 * 1000), // yesterday
    finishedAt: new Date(Date.now() - 25.5 * 60 * 60 * 1000),
    duration: 45,
    progress: 100,
    tasks: [
      { id: 't1', title: 'Setup Express routes', status: 'done' },
      { id: 't2', title: 'Add CRUD endpoints', status: 'done' },
      { id: 't3', title: 'Add validation', status: 'done' },
    ],
    filesChanged: ['src/routes/api.ts', 'src/middleware/validation.ts'],
    commits: [
      { id: 'c1', message: 'feat: add REST API routes', timestamp: new Date(), author: 'Dev Agent' },
    ],
  },
  {
    id: 'build-5',
    projectId: 'doniq-design',
    projectName: 'doniq-design',
    task: 'Components',
    status: 'paused',
    startedAt: new Date(Date.now() - 28 * 60 * 60 * 1000), // yesterday
    progress: 60,
    tasks: [
      { id: 't1', title: 'Design button components', status: 'done' },
      { id: 't2', title: 'Design card components', status: 'done' },
      { id: 't3', title: 'Design modal components', status: 'in_progress' },
      { id: 't4', title: 'Create documentation', status: 'pending' },
    ],
    filesChanged: ['src/components/Button.tsx', 'src/components/Card.tsx'],
    commits: [],
  },
];

const sampleActiveProjects: ActiveProject[] = [
  {
    id: 'active-1',
    projectId: 'command-center',
    name: 'command-center',
    progress: 80,
    currentTask: 'Build Dashboard',
    startedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
    duration: 15,
    status: 'building',
  },
  {
    id: 'active-2',
    projectId: 'doniq-app',
    name: 'doniq-app',
    progress: 40,
    currentTask: 'Integrar Stripe',
    startedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000), // 2h 30min ago
    duration: 150,
    status: 'building',
  },
];

interface BuildHistoryActions {
  // Build actions
  addBuild: (build: Omit<Build, 'id'>) => void;
  updateBuild: (id: string, data: Partial<Build>) => void;
  completeBuild: (id: string) => void;

  // Active project actions
  addActiveProject: (project: Omit<ActiveProject, 'id'>) => void;
  updateActiveProject: (id: string, data: Partial<ActiveProject>) => void;
  pauseActiveProject: (id: string) => void;
  stopActiveProject: (id: string) => void;
  removeActiveProject: (id: string) => void;

  // Selection
  setSelectedBuild: (id: string | null) => void;

  // Filters
  setFilter: (filter: Partial<BuildHistoryState['filter']>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;

  // Stats
  updateStats: (stats: Partial<BuildStats>) => void;

  // Export
  exportToJSON: () => string;
  exportToCSV: () => string;

  // Real-time updates
  simulateBuildProgress: () => void;
}

export const useBuildHistoryStore = create<BuildHistoryState & BuildHistoryActions>()(
  persist(
    (set, get) => ({
      // Initial state
      builds: sampleBuilds,
      activeProjects: sampleActiveProjects,
      stats: initialStats,
      selectedBuildId: null,
      filter: {
        project: null,
        status: 'all',
        dateRange: 'all',
      },
      searchQuery: '',

      // Build actions
      addBuild: (buildData) => {
        const newBuild: Build = {
          ...buildData,
          id: `build-${Date.now()}`,
        };
        set((state) => ({
          builds: [newBuild, ...state.builds],
        }));
      },

      updateBuild: (id, data) => {
        set((state) => ({
          builds: state.builds.map((b) =>
            b.id === id ? { ...b, ...data } : b
          ),
        }));
      },

      completeBuild: (id) => {
        const now = new Date();
        set((state) => {
          const build = state.builds.find((b) => b.id === id);
          if (!build) return state;

          const duration = Math.floor(
            (now.getTime() - build.startedAt.getTime()) / (1000 * 60)
          );

          const completedBuild: Build = {
            ...build,
            status: 'completed',
            finishedAt: now,
            duration,
            progress: 100,
            tasks: build.tasks.map((t) =>
              t.status === 'in_progress' ? { ...t, status: 'done' as const } : t
            ),
          };

          // Remove from active projects if exists
          const activeProject = state.activeProjects.find(
            (ap) => ap.projectId === build.projectId
          );

          return {
            builds: state.builds.map((b) =>
              b.id === id ? completedBuild : b
            ),
            activeProjects: activeProject
              ? state.activeProjects.filter((ap) => ap.id !== activeProject.id)
              : state.activeProjects,
            stats: {
              ...state.stats,
              projectsCompleted: state.stats.projectsCompleted + 1,
              projectsInProgress: Math.max(0, state.stats.projectsInProgress - (activeProject ? 1 : 0)),
            },
          };
        });
      },

      // Active project actions
      addActiveProject: (projectData) => {
        const newProject: ActiveProject = {
          ...projectData,
          id: `active-${Date.now()}`,
        };
        set((state) => ({
          activeProjects: [...state.activeProjects, newProject],
          stats: {
            ...state.stats,
            projectsInProgress: state.stats.projectsInProgress + 1,
          },
        }));
      },

      updateActiveProject: (id, data) => {
        set((state) => ({
          activeProjects: state.activeProjects.map((ap) =>
            ap.id === id ? { ...ap, ...data } : ap
          ),
        }));
      },

      pauseActiveProject: (id) => {
        set((state) => ({
          activeProjects: state.activeProjects.map((ap) =>
            ap.id === id ? { ...ap, status: 'paused' as const } : ap
          ),
        }));
      },

      stopActiveProject: (id) => {
        set((state) => ({
          activeProjects: state.activeProjects.filter((ap) => ap.id !== id),
          stats: {
            ...state.stats,
            projectsInProgress: Math.max(0, state.stats.projectsInProgress - 1),
          },
        }));
      },

      removeActiveProject: (id) => {
        set((state) => ({
          activeProjects: state.activeProjects.filter((ap) => ap.id !== id),
        }));
      },

      // Selection
      setSelectedBuild: (id) => {
        set({ selectedBuildId: id });
      },

      // Filters
      setFilter: (filter) => {
        set((state) => ({
          filter: { ...state.filter, ...filter },
        }));
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      clearFilters: () => {
        set({
          filter: {
            project: null,
            status: 'all',
            dateRange: 'all',
          },
          searchQuery: '',
        });
      },

      // Stats
      updateStats: (stats) => {
        set((state) => ({
          stats: { ...state.stats, ...stats },
        }));
      },

      // Export
      exportToJSON: () => {
        const state = get();
        const exportData = {
          builds: state.builds,
          activeProjects: state.activeProjects,
          stats: state.stats,
          exportedAt: new Date().toISOString(),
        };
        return JSON.stringify(exportData, null, 2);
      },

      exportToCSV: () => {
        const state = get();
        const headers = ['ID', 'Project', 'Task', 'Status', 'Started', 'Finished', 'Duration (min)', 'Progress (%)'];
        const rows = state.builds.map((b) => [
          b.id,
          b.projectName,
          b.task,
          b.status,
          b.startedAt.toISOString(),
          b.finishedAt?.toISOString() || '',
          b.duration || '',
          b.progress,
        ]);

        const csvContent = [
          headers.join(','),
          ...rows.map((row) => row.join(',')),
        ].join('\n');

        return csvContent;
      },

      // Real-time updates
      simulateBuildProgress: () => {
        set((state) => ({
          activeProjects: state.activeProjects.map((ap) => {
            if (ap.status !== 'building') return ap;

            const newProgress = Math.min(100, ap.progress + Math.random() * 5);
            const newDuration = ap.duration + 1;

            if (newProgress >= 100) {
              // Build completed - the newBuild data could be used to add to builds array
              // For now we just update the active project status
              return {
                ...ap,
                progress: 100,
                duration: newDuration,
                status: 'stopped' as const,
              };
            }

            return {
              ...ap,
              progress: newProgress,
              duration: newDuration,
            };
          }),
        }));
      },
    }),
    {
      name: 'build-history-storage',
      partialize: (state) => ({
        builds: state.builds,
        activeProjects: state.activeProjects,
        stats: state.stats,
      }),
    }
  )
);

// Selector hooks for filtered data
export const useFilteredBuilds = () => {
  const { builds, filter, searchQuery } = useBuildHistoryStore();

  return builds.filter((build) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !build.projectName.toLowerCase().includes(query) &&
        !build.task.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Project filter
    if (filter.project && build.projectId !== filter.project) {
      return false;
    }

    // Status filter
    if (filter.status !== 'all' && build.status !== filter.status) {
      return false;
    }

    // Date range filter
    const now = new Date();
    const buildDate = new Date(build.startedAt);

    if (filter.dateRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (buildDate < today) return false;
    } else if (filter.dateRange === 'yesterday') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      if (buildDate < yesterday || buildDate >= today) return false;
    } else if (filter.dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (buildDate < weekAgo) return false;
    }

    return true;
  });
};

// Group builds by date
export const useBuildsGroupedByDate = () => {
  const filteredBuilds = useFilteredBuilds();

  const grouped: { today: Build[]; yesterday: Build[]; week: Build[]; older: Build[] } = {
    today: [],
    yesterday: [],
    week: [],
    older: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  filteredBuilds.forEach((build) => {
    const buildDate = new Date(build.startedAt);

    if (buildDate >= today) {
      grouped.today.push(build);
    } else if (buildDate >= yesterday) {
      grouped.yesterday.push(build);
    } else if (buildDate >= weekAgo) {
      grouped.week.push(build);
    } else {
      grouped.older.push(build);
    }
  });

  return grouped;
};
