/**
 * External Advisory Council System
 * P1 from Benchmark Comparison
 *
 * Pool of independent reviewers for special cases:
 * - 3-5 external people
 * - Read-only access to audit log
 * - Issue non-binding opinions
 * - Used for edge cases or disputes
 */

export type CouncilMemberRole = 'chair' | 'member' | 'observer';
export type CouncilSpecialty =
  | 'legal'
  | 'compliance'
  | 'brand'
  | 'marketing'
  | 'technical'
  | 'ethics'
  | 'public_relations';

export type CouncilCaseStatus =
  | 'pending_assignment'
  | 'assigned'
  | 'under_review'
  | 'opinion_issued'
  | 'closed'
  | 'expired';

export interface CouncilMember {
  id: string;
  name: string;
  title: string;
  organization: string;
  email: string;
  role: CouncilMemberRole;
  specialties: CouncilSpecialty[];
  status: 'active' | 'inactive' | 'on_leave';
  joinedAt: Date;
  lastActiveAt: Date | null;
  casesReviewed: number;
  opinionsIssued: number;
  avatar?: string; // URL or initials
  bio?: string;
  availability: 'available' | 'limited' | 'unavailable';
  maxCasesPerMonth: number;
  currentCasesCount: number;
}

export interface CouncilCase {
  id: string;
  // Reference to the original item
  referenceId: string;
  referenceTitle: string;
  referenceType: 'approval' | 'appeal' | 'strike' | 'policy' | 'other';

  // Case details
  status: CouncilCaseStatus;
  priority: 'normal' | 'elevated' | 'urgent';
  category: CouncilSpecialty[];

  // Assignment
  assignedTo: string[]; // Member IDs
  assignedAt: Date | null;
  deadline: Date | null;

  // Content
  summary: string;
  context: string;
  questions: string[];
  relevantDocuments: CouncilDocument[];

  // Deliberation
  opinions: CouncilOpinion[];
  finalOpinion: string | null;
  recommendation: 'approve' | 'reject' | 'modify' | 'escalate' | 'no_action';
  confidence: number; // 0-100

  // Timeline
  createdAt: Date;
  closedAt: Date | null;
  createdBy: string;

  // Metadata
  tags: string[];
  requiresUnanimousDecision: boolean;
  votingDeadline: Date | null;
}

export interface CouncilDocument {
  id: string;
  name: string;
  type: 'policy' | 'report' | 'email' | 'screenshot' | 'other';
  url?: string;
  description?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface CouncilOpinion {
  id: string;
  memberId: string;
  memberName: string;
  position: 'in_favor' | 'against' | 'abstain' | 'needs_more_info';
  opinion: string;
  reasoning: string;
  confidence: number; // 0-100
  concerns: string[];
  suggestions: string[];
  createdAt: Date;
  updatedAt: Date | null;
  isFinal: boolean;
}

export interface CouncilConfig {
  enabled: boolean;
  minMembers: number;        // Minimum active members (default: 3)
  maxMembers: number;        // Maximum pool size (default: 10)
  quorumSize: number;        // Minimum members to render decision valid (default: 3)
  defaultDeadlineHours: number; // Default hours to respond (default: 72)
  reminderBeforeHours: number;   // Hours before deadline to send reminder (default: 24)
  requireUnanimousForUrgent: boolean; // Require unanimous for urgent cases
  allowObserverParticipation: boolean;
  maxActiveCasesPerMember: number;
  rotationEnabled: boolean;
  rotationIntervalDays: number;
}

// Default configuration
export const DEFAULT_COUNCIL_CONFIG: CouncilConfig = {
  enabled: true,
  minMembers: 3,
  maxMembers: 10,
  quorumSize: 3,
  defaultDeadlineHours: 72,
  reminderBeforeHours: 24,
  requireUnanimousForUrgent: true,
  allowObserverParticipation: false,
  maxActiveCasesPerMember: 3,
  rotationEnabled: false,
  rotationIntervalDays: 30,
};

// SPECIALTY LABELS
export const COUNCIL_SPECIALTY_LABELS: Record<CouncilSpecialty, string> = {
  legal: 'Jurídico',
  compliance: 'Compliance',
  brand: 'Marca',
  marketing: 'Marketing',
  technical: 'Técnico',
  ethics: 'Ética',
  public_relations: 'Relações Públicas',
};

// ROLE LABELS
export const COUNCIL_ROLE_LABELS: Record<CouncilMemberRole, string> = {
  chair: 'Presidente',
  member: 'Membro',
  observer: 'Observador',
};

// STATUS LABELS
export const COUNCIL_STATUS_LABELS: Record<CouncilCaseStatus, string> = {
  pending_assignment: 'Pendente',
  assigned: 'Atribuído',
  under_review: 'Em Revisão',
  opinion_issued: 'Parecer Emitido',
  closed: 'Encerrado',
  expired: 'Expirado',
};

// POSITION LABELS
export const COUNCIL_POSITION_LABELS: Record<CouncilOpinion['position'], string> = {
  in_favor: 'A Favor',
  against: 'Contra',
  abstain: 'Abstenção',
  needs_more_info: 'Precisa de Mais Info',
};

/**
 * Get available specialties
 */
export function getAvailableSpecialties(): Array<{
  value: CouncilSpecialty;
  label: string;
  icon: string;
}> {
  return [
    { value: 'legal', label: 'Jurídico', icon: '⚖️' },
    { value: 'compliance', label: 'Compliance', icon: '🛡️' },
    { value: 'brand', label: 'Marca', icon: '🎨' },
    { value: 'marketing', label: 'Marketing', icon: '📢' },
    { value: 'technical', label: 'Técnico', icon: '💻' },
    { value: 'ethics', label: 'Ética', icon: '⚠️' },
    { value: 'public_relations', label: 'Relações Públicas', icon: '🗣️' },
  ];
}

/**
 * Check if quorum is met
 */
export function isQuorumMet(
  opinionCount: number,
  config: CouncilConfig = DEFAULT_COUNCIL_CONFIG
): boolean {
  return opinionCount >= config.quorumSize;
}

/**
 * Calculate decision from opinions
 */
export function calculateCouncilDecision(
  opinions: CouncilOpinion[],
  _config: CouncilConfig = DEFAULT_COUNCIL_CONFIG
): {
  recommendation: CouncilCase['recommendation'];
  confidence: number;
  isUnanimous: boolean;
  isConsensus: boolean;
} {
  if (opinions.length === 0) {
    return {
      recommendation: 'no_action',
      confidence: 0,
      isUnanimous: false,
      isConsensus: false,
    };
  }

  const positions = opinions.map((o) => o.position);
  const inFavorCount = positions.filter((p) => p === 'in_favor').length;
  const againstCount = positions.filter((p) => p === 'against').length;
  const needsInfoCount = positions.filter((p) => p === 'needs_more_info').length;

  const totalVoting = inFavorCount + againstCount;
  const isUnanimous = totalVoting > 0 && (inFavorCount === totalVoting || againstCount === totalVoting);
  const isConsensus = totalVoting > 0 && (inFavorCount > againstCount && inFavorCount >= totalVoting * 0.7);

  // Calculate confidence
  const avgConfidence = opinions.reduce((sum, o) => sum + o.confidence, 0) / opinions.length;
  const confidence = Math.round(avgConfidence);

  // Determine recommendation
  let recommendation: CouncilCase['recommendation'];
  if (needsInfoCount > 0) {
    recommendation = 'escalate';
  } else if (isUnanimous || isConsensus) {
    recommendation = inFavorCount > againstCount ? 'approve' : 'reject';
  } else if (inFavorCount > againstCount) {
    recommendation = 'modify';
  } else if (againstCount > inFavorCount) {
    recommendation = 'reject';
  } else {
    recommendation = 'no_action';
  }

  return { recommendation, confidence, isUnanimous, isConsensus };
}

/**
 * Get case urgency color
 */
export function getCaseUrgencyColor(priority: CouncilCase['priority']): {
  bg: string;
  text: string;
  border: string;
} {
  switch (priority) {
    case 'urgent':
      return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' };
    case 'elevated':
      return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    default:
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
  }
}

/**
 * Check if member is available
 */
export function isMemberAvailable(
  member: CouncilMember,
  _config: CouncilConfig = DEFAULT_COUNCIL_CONFIG
): boolean {
  if (member.status !== 'active') return false;
  if (member.availability === 'unavailable') return false;
  if (member.currentCasesCount >= member.maxCasesPerMonth) return false;
  return true;
}

/**
 * Suggest members for a case based on specialties
 */
export function suggestMembersForCase(
  allMembers: CouncilMember[],
  requiredSpecialties: CouncilSpecialty[],
  config: CouncilConfig = DEFAULT_COUNCIL_CONFIG
): CouncilMember[] {
  return allMembers
    .filter((m) => isMemberAvailable(m, config))
    .filter((m) => requiredSpecialties.some((s) => m.specialties.includes(s)))
    .sort((a, b) => {
      // Prefer members with fewer current cases
      if (a.currentCasesCount !== b.currentCasesCount) {
        return a.currentCasesCount - b.currentCasesCount;
      }
      // Prefer members with more experience
      return b.casesReviewed - a.casesReviewed;
    })
    .slice(0, config.quorumSize);
}

/**
 * Create a new council case
 */
export function createCouncilCase(
  referenceId: string,
  referenceTitle: string,
  referenceType: CouncilCase['referenceType'],
  summary: string,
  context: string,
  questions: string[],
  category: CouncilSpecialty[],
  createdBy: string,
  priority: CouncilCase['priority'] = 'normal',
  config: CouncilConfig = DEFAULT_COUNCIL_CONFIG
): CouncilCase {
  const now = new Date();
  const deadline = new Date(now.getTime() + config.defaultDeadlineHours * 60 * 60 * 1000);
  const votingDeadline = new Date(now.getTime() + config.defaultDeadlineHours * 2 * 60 * 60 * 1000);

  return {
    id: `council-case-${Date.now()}`,
    referenceId,
    referenceTitle,
    referenceType,
    status: 'pending_assignment',
    priority,
    category,
    assignedTo: [],
    assignedAt: null,
    deadline,
    summary,
    context,
    questions,
    relevantDocuments: [],
    opinions: [],
    finalOpinion: null,
    recommendation: 'no_action',
    confidence: 0,
    createdAt: now,
    closedAt: null,
    createdBy,
    tags: [],
    requiresUnanimousDecision: priority === 'urgent' && config.requireUnanimousForUrgent,
    votingDeadline,
  };
}
