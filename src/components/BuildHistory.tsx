import React from 'react';
import { History, Clock, CheckCircle2, XCircle, Loader2, FolderKanban } from 'lucide-react';

interface Build {
  id: string;
  projectName: string;
  status: 'completed' | 'in_progress' | 'paused' | 'error';
  progress: number;
  startedAt: Date;
  duration: number;
  commits: number;
}

interface BuildHistoryProps {
  builds?: Build[];
}

const defaultBuilds: Build[] = [
  { id: '1', projectName: 'Doniq', status: 'in_progress', progress: 72, startedAt: new Date(Date.now() - 1800000), duration: 1800, commits: 12 },
  { id: '2', projectName: 'Meu Site', status: 'completed', progress: 100, startedAt: new Date(Date.now() - 3600000), duration: 3600, commits: 24 },
  { id: '3', projectName: 'App Mobile', status: 'paused', progress: 30, startedAt: new Date(Date.now() - 7200000), duration: 7200, commits: 8 },
  { id: '4', projectName: 'AIOS Platform', status: 'error', progress: 45, startedAt: new Date(Date.now() - 86400000), duration: 86400, commits: 18 },
  { id: '5', projectName: 'Brand Refresh', status: 'completed', progress: 100, startedAt: new Date(Date.now() - 172800000), duration: 172800, commits: 32 },
];

const statusConfig = {
  completed: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Concluído' },
  in_progress: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Em Progresso' },
  paused: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Pausado' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Erro' },
};

export const BuildHistory: React.FC<BuildHistoryProps> = ({ builds = defaultBuilds }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Build History</h3>
      </div>
      {builds.map(build => {
        const config = statusConfig[build.status];
        const Icon = config.icon;
        return (
          <div key={build.id} className="bg-slate-800/60 rounded-lg border border-slate-700/50 p-3 hover:border-slate-600/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-white">{build.projectName}</span>
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${config.bg}`}>
                <Icon className={`w-3 h-3 ${config.color} ${build.status === 'in_progress' ? 'animate-spin' : ''}`} />
                <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400">
                {Math.floor(build.duration / 60)}m • {build.commits} commits
              </span>
              <span className="text-blue-400 font-medium">{build.progress}%</span>
            </div>
            <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  build.status === 'completed' ? 'bg-green-500' :
                  build.status === 'error' ? 'bg-red-500' :
                  build.status === 'paused' ? 'bg-amber-500' :
                  'bg-gradient-to-r from-blue-500 to-blue-400'
                }`}
                style={{ width: `${build.progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BuildHistory;
