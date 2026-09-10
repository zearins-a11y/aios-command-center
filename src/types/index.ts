export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'error';
  progress: number;
  lastActivity: Date;
  squads: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  status: 'available' | 'working' | 'error' | 'offline';
  avatar?: string;
  commands: Command[];
  squadId: string;
}

export interface Command {
  id: string;
  icon: string;
  label: string;
  action: string;
}

export interface Squad {
  id: string;
  name: string;
  icon: string;
  parentId: string | null;
  agents: Agent[];
  color: string;
  description: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  source: string;
  message: string;
}

export interface Suggestion {
  id: string;
  icon: string;
  text: string;
  actions: { label: string; action: string }[];
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface SystemStatus {
  api: boolean;
  database: boolean;
  activeAgents: number;
  totalAgents: number;
}

// Build History Types
export type BuildStatus = 'completed' | 'in_progress' | 'paused' | 'error' | 'pending';

export interface BuildTask {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'done';
}

export interface BuildCommit {
  id: string;
  message: string;
  timestamp: Date;
  author: string;
}

export interface Build {
  id: string;
  projectId: string;
  projectName: string;
  task: string;
  status: BuildStatus;
  startedAt: Date;
  finishedAt?: Date;
  duration?: number; // in minutes
  tasks: BuildTask[];
  filesChanged: string[];
  commits: BuildCommit[];
  progress: number;
}

export interface ActiveProject {
  id: string;
  projectId: string;
  name: string;
  progress: number;
  currentTask: string;
  startedAt: Date;
  duration: number; // in minutes
  status: 'building' | 'paused' | 'stopped';
}

export interface BuildStats {
  projectsCompleted: number;
  projectsInProgress: number;
  linesOfCode: number;
  totalTime: number; // in minutes
  weeklyActivity: {
    day: string;
    hours: number;
  }[];
}

export interface BuildHistoryState {
  builds: Build[];
  activeProjects: ActiveProject[];
  stats: BuildStats;
  selectedBuildId: string | null;
  filter: {
    project: string | null;
    status: BuildStatus | 'all';
    dateRange: 'today' | 'yesterday' | 'week' | 'all';
  };
  searchQuery: string;
}
