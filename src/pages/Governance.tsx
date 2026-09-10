import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Bell, Clock, AlertTriangle } from 'lucide-react';
import { useGovernanceStore } from '../stores/useGovernanceStore';
import { ConnectionStatus } from '../components/SupabaseStatus';
import {
  FlowDiagram,
  ApprovalQueue,
  SensitiveActions,
  AgentRoles,
  AuditLog,
  ApprovalModal,
  StrikePanel,
} from '../components/governance';

export const Governance: React.FC = () => {
  const {
    currentStage,
    completedStages,
    pendingApprovals,
    rankedApprovals,
    selectedApprovalId,
    sensitiveActions,
    agentRoles,
    auditLog,
    showApprovalModal,
    selectApproval,
    updateApprovalStatus,
    requestRevision,
    approveSensitiveAction,
    rejectSensitiveAction,
    setShowApprovalModal,
    loadFromSupabase,
    subscribeRealtime,
    unsubscribeRealtime,
  } = useGovernanceStore();

  // Initialize Supabase connection
  useEffect(() => {
    loadFromSupabase();
    subscribeRealtime();
    return () => unsubscribeRealtime();
  }, [loadFromSupabase, subscribeRealtime, unsubscribeRealtime]);

  const selectedApproval = pendingApprovals.find((a) => a.id === selectedApprovalId);

  const urgentCount = pendingApprovals.filter((a) => a.urgency === 'urgent').length;
  const pendingCount = pendingApprovals.length;
  const criticalCount = rankedApprovals.filter((a) => a.riskScore.rank === 'critical').length;

  const handleStageClick = (stage: string) => {
    if (stage === 'human_gate') {
      const firstPending = pendingApprovals[0];
      if (firstPending) {
        selectApproval(firstPending.id);
      }
    }
  };

  const handleApprove = (id: string) => {
    updateApprovalStatus(id, 'approved');
  };

  const handleReject = (id: string) => {
    updateApprovalStatus(id, 'rejected');
  };

  const handleRequestRevision = (id: string, feedback?: string) => {
    requestRevision(id, feedback || '');
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-default">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] flex items-center justify-center">
                <Shield size={24} className="text-bg-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  Governance
                </h1>
                <p className="text-sm text-text-muted">
                  Controle e aprovacao de conteudos
                </p>
              </div>
            </div>

            {/* Pending badge */}
            {pendingCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl
                  ${urgentCount > 0 ? 'bg-red-500/20' : 'bg-[#fbbf24]/20'}
                `}
              >
                {urgentCount > 0 && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
                <Bell
                  size={16}
                  className={urgentCount > 0 ? 'text-red-400' : 'text-[#fbbf24]'}
                />
                <span
                  className={`text-sm font-semibold ${
                    urgentCount > 0 ? 'text-red-400' : 'text-[#fbbf24]'
                  }`}
                >
                  {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
                </span>
              </motion.div>
            )}

            {/* Supabase Connection Status */}
            <ConnectionStatus />
          </div>
        </div>
      </div>

      {/* Flow Diagram - Signature Element */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-secondary/50 border-b border-border-default py-6"
      >
        <div className="px-6">
          <h2 className="text-xs font-medium text-text-dim uppercase tracking-wider mb-4">
            Pipeline de Aprovacao
          </h2>
          <FlowDiagram
            currentStage={currentStage}
            completedStages={completedStages}
            onStageClick={handleStageClick}
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Top Row: Agent Roles + Sensitive Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Agent Roles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                Papéis dos Agentes
              </h2>
            </div>
            <AgentRoles agents={agentRoles} />
          </motion.div>

          {/* Sensitive Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                Acoes Sensiveis
              </h2>
              {sensitiveActions.filter((a) => a.status === 'awaiting_human').length > 0 && (
                <span className="flex items-center gap-1 text-xs text-[#fbbf24] bg-[#fbbf24]/10 px-2 py-0.5 rounded">
                  <AlertTriangle size={12} />
                  Requer atencao
                </span>
              )}
            </div>
            <SensitiveActions
              actions={sensitiveActions}
              onApprove={approveSensitiveAction}
              onReject={rejectSensitiveAction}
            />
          </motion.div>
        </div>

        {/* Approval Queue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#fbbf24]" />
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                Fila de Aprovacoes
              </h2>
              {pendingCount > 0 && (
                <span className="bg-[#fbbf24]/20 text-[#fbbf24] text-xs font-medium px-2 py-0.5 rounded">
                  {pendingCount} item{pendingCount > 1 ? 'ns' : ''}
                </span>
              )}
            </div>
            {urgentCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                {urgentCount} urgente{urgentCount > 1 ? 's' : ''}
              </span>
            )}
            {criticalCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-[#fbbf24] bg-[#fbbf24]/10 px-3 py-1 rounded-lg">
                <Shield size={12} />
                {criticalCount} critico{criticalCount > 1 ? 's' : ''} por score
              </span>
            )}
          </div>

          {rankedApprovals.length > 0 ? (
            <ApprovalQueue
              items={rankedApprovals}
              onSelectItem={selectApproval}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestRevision={handleRequestRevision}
            />
          ) : (
            <div className="bg-bg-card border border-border-default rounded-xl p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
                  <Shield size={32} className="text-[#22c55e]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Tudo em dia!
                  </h3>
                  <p className="text-sm text-text-muted">
                    Nenhuma aprovacao pendente. Seu pipeline esta limpo.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Audit Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AuditLog entries={auditLog.slice(0, 10)} />
        </motion.div>

        {/* Strike System - Compact View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-bg-card border border-border-default rounded-xl p-6">
            <StrikePanel compact />
          </div>
        </motion.div>
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        item={selectedApproval || null}
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          selectApproval(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestRevision={handleRequestRevision}
      />
    </div>
  );
};
