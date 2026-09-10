import React, { useEffect, useRef } from 'react';
import { Search, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button, Input } from '../ui';
import { useStore } from '../../stores/useStore';
import { LogEntry } from '../../types';

export const Console: React.FC = () => {
  const {
    logs,
    logFilter,
    autoScroll,
    logSearch,
    setLogFilter,
    setAutoScroll,
    setLogSearch,
    clearLogs,
    addLog,
    consoleHeight,
    setConsoleHeight,
  } = useStore();

  const logContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Auto-scroll when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newHeight = window.innerHeight - e.clientY - 64;
      setConsoleHeight(Math.max(120, Math.min(400, newHeight)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, setConsoleHeight]);

  // Simulate new logs periodically
  useEffect(() => {
    const messages = [
      { source: 'AIOS Dev', messages: ['Compilando módulo...', 'Build concluído', 'Executando testes unitários', 'Verificando tipagens'] },
      { source: 'QA Agent', messages: ['Análise de cobertura: 87%', 'Testes de regressão OK', 'Validando fluxos de usuário'] },
      { source: 'PM Agent', messages: ['Sprint planning iniciado', 'Tasks redistribuídas', 'Burndown atualizado'] },
      { source: 'Data Engineer', messages: ['ETL processado', 'Métricas atualizadas', 'Dashboard sincronizado'] },
      { source: 'DevOps', messages: ['Deploy em staging', 'Health check OK', 'CD pipeline executado'] },
    ];

    const interval = setInterval(() => {
      const randomSource = messages[Math.floor(Math.random() * messages.length)];
      const randomMessage = randomSource.messages[Math.floor(Math.random() * randomSource.messages.length)];
      const types: Array<'info' | 'success' | 'warning'> = ['info', 'info', 'info', 'success', 'warning'];
      const randomType = types[Math.floor(Math.random() * types.length)];

      addLog({
        type: randomType,
        source: randomSource.source,
        message: randomMessage,
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [addLog]);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter =
      logFilter === 'all' ||
      log.type === logFilter ||
      (logFilter === 'build' && log.source === 'AIOS Dev') ||
      (logFilter === 'error' && log.type === 'error') ||
      (logFilter === 'success' && log.type === 'success');

    const matchesSearch =
      logSearch === '' ||
      log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.source.toLowerCase().includes(logSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-text-muted';
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return '●';
    }
  };

  return (
    <div
      className="bg-bg-secondary border-t border-border-default flex flex-col"
      style={{ height: consoleHeight }}
    >
      {/* Resize Handle */}
      <div
        className="h-1 bg-border-default hover:bg-primary cursor-ns-resize transition-colors"
        onMouseDown={() => setIsDragging(true)}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-default bg-bg-card/50">
        <div className="flex items-center gap-4">
          {/* Live Indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            <span className="text-xs font-semibold text-success uppercase tracking-wider">Live</span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1">
            {(['all', 'build', 'error', 'success'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setLogFilter(filter)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  logFilter === filter
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:bg-bg-card hover:text-text-primary'
                }`}
              >
                {filter === 'all' ? 'ALL' : filter.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="w-48">
            <Input
              placeholder="Buscar logs..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              icon={<Search size={14} />}
            />
          </div>

          {/* Auto-scroll Toggle */}
          <Button
            variant={autoScroll ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
          >
            Auto-scroll {autoScroll ? 'ON' : 'OFF'}
          </Button>

          {/* Clear */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearLogs}
            icon={<Trash2 size={14} />}
          >
            Limpar
          </Button>

          {/* Resize buttons */}
          <div className="flex gap-1 ml-2">
            <Button variant="ghost" size="sm" onClick={() => setConsoleHeight(120)}>
              <ChevronUp size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConsoleHeight(320)}>
              <ChevronDown size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Log Content */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-2 font-mono text-xs"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-dim">
            <p>Nenhum log encontrado</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start gap-2 px-2 py-1 hover:bg-bg-card/50 rounded ${getLogColor(log.type)}`}
            >
              <span className="text-text-dim flex-shrink-0">
                {formatTime(log.timestamp)}
              </span>
              <span className={`flex-shrink-0 ${getLogColor(log.type)}`}>
                {getLogIcon(log.type)}
              </span>
              <span className="text-primary flex-shrink-0">
                {log.source}:
              </span>
              <span className="flex-1 text-text-primary break-all">
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
