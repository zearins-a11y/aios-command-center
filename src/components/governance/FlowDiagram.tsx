import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { FlowStage } from '../../types/governance';

interface FlowDiagramProps {
  currentStage: FlowStage;
  completedStages: FlowStage[];
  onStageClick: (stage: FlowStage) => void;
}

const stages: { id: FlowStage; label: string; sublabel: string }[] = [
  { id: 'research', label: 'Pesquisa', sublabel: 'concluido' },
  { id: 'creation', label: 'Criacao', sublabel: 'concluido' },
  { id: 'validation', label: 'Validacao', sublabel: 'concluido' },
  { id: 'human_gate', label: 'Aguardando', sublabel: 'VOCE' },
  { id: 'publication', label: 'Publicacao', sublabel: 'parado' },
];

export const FlowDiagram: React.FC<FlowDiagramProps> = ({
  currentStage,
  completedStages,
  onStageClick,
}) => {
  const getStageStatus = (stageId: FlowStage) => {
    if (completedStages.includes(stageId)) return 'completed';
    if (stageId === currentStage) return 'active';
    return 'pending';
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'active':
        return '#fbbf24';
      default:
        return '#2d2d44';
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check size={18} strokeWidth={3} />;
      case 'active':
        return <Clock size={18} />;
      default:
        return <AlertCircle size={18} />;
    }
  };

  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="flex items-center justify-center min-w-max px-4">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.id);
          const color = getStageColor(status);
          const isClickable = status === 'active';
          const isHumanGate = stage.id === 'human_gate';

          return (
            <React.Fragment key={stage.id}>
              {/* Node */}
              <motion.div
                className={`
                  relative flex flex-col items-center cursor-pointer
                  ${isClickable ? 'z-10' : ''}
                `}
                onClick={() => isClickable && onStageClick(stage.id)}
                whileHover={isClickable ? { scale: 1.05 } : {}}
                whileTap={isClickable ? { scale: 0.98 } : {}}
              >
                {/* Glow effect for active node */}
                {isHumanGate && status === 'active' && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: `radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)`,
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                {/* Node box */}
                <motion.div
                  className={`
                    relative flex flex-col items-center justify-center
                    w-24 h-20 rounded-xl border-2
                    ${isHumanGate && status === 'active' ? 'border-[#fbbf24]' : 'border-border-default'}
                  `}
                  style={{
                    backgroundColor: status === 'pending' ? '#14141f' : '#1e1e2e',
                    borderColor: color,
                    boxShadow:
                      isHumanGate && status === 'active'
                        ? `0 0 20px rgba(251,191,36,0.5), 0 0 40px rgba(251,191,36,0.3)`
                        : status === 'completed'
                        ? `0 0 10px ${color}40`
                        : 'none',
                  }}
                  animate={
                    isHumanGate && status === 'active'
                      ? {
                          scale: [1, 1.03, 1],
                        }
                      : {}
                  }
                  transition={
                    isHumanGate && status === 'active'
                      ? {
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }
                      : {}
                  }
                >
                  {/* Status icon */}
                  <div
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full mb-1
                      ${status === 'completed' ? 'bg-[#22c55e]/20' : ''}
                      ${status === 'active' && isHumanGate ? 'bg-[#fbbf24]/20' : ''}
                    `}
                    style={{ color }}
                  >
                    {getIcon(status)}
                  </div>

                  {/* Label */}
                  <span
                    className={`
                      text-xs font-semibold text-center leading-tight
                      ${status === 'pending' ? 'text-text-dim' : 'text-text-primary'}
                    `}
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: isHumanGate && status === 'active' ? '#fbbf24' : undefined,
                    }}
                  >
                    {isHumanGate && status === 'active' ? 'AGUARDANDO' : stage.label}
                  </span>

                  {/* Sublabel */}
                  <span
                    className={`
                      text-[10px] mt-0.5
                      ${status === 'completed' ? 'text-[#22c55e]' : ''}
                      ${status === 'active' && isHumanGate ? 'text-[#fbbf24]' : 'text-text-dim'}
                    `}
                  >
                    {stage.sublabel}
                  </span>
                </motion.div>
              </motion.div>

              {/* Connector line */}
              {index < stages.length - 1 && (
                <div className="flex items-center mx-1">
                  {/* Animated progress line for completed stages */}
                  {status === 'completed' && (
                    <motion.div
                      className="h-0.5 bg-gradient-to-r from-[#22c55e] to-[#22c55e]"
                      initial={{ width: 0 }}
                      animate={{ width: 32 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  )}
                  {/* Pending line */}
                  {status !== 'completed' && (
                    <div
                      className={`
                        h-0.5 w-8
                        ${status === 'active' ? 'bg-[#fbbf24]/50' : 'bg-border-default'}
                      `}
                      style={{
                        background:
                          status === 'active'
                            ? 'linear-gradient(to right, #fbbf24, #fbbf24)'
                            : undefined,
                      }}
                    />
                  )}
                  {/* Arrow */}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    className="ml-0.5"
                  >
                    <path
                      d="M3 6L9 6M9 6L6 3M9 6L6 9"
                      stroke={
                        status === 'completed'
                          ? '#22c55e'
                          : status === 'active'
                          ? '#fbbf24'
                          : '#2d2d44'
                      }
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
