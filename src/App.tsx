import { useEffect, useRef } from 'react';
import { Portfolio, ProjectDashboard, Governance, AgentEvaluation, StrikeSystem, ThresholdSystem, Appeals, FeedbackLoop, Council, PublicExceptions, RegionalAdaptation, HealthMetrics } from './pages';
import { ToastContainer } from './components/ui';
import { useStore } from './stores/useStore';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AcceptInvite from './pages/AcceptInvite';
import TeamManagement from './pages/admin/TeamManagement';
import AuditLogs from './pages/admin/AuditLogs';

function App() {
  const { currentPage, setCurrentPage } = useStore();
  const isInitialMount = useRef(true);

  // Check if we're on an auth page based on URL hash
  const hash = window.location.hash.replace('#', '');
  const isAuthPage = hash === 'login' || hash === 'signup' || hash === 'accept-invite';

  // Auth pages don't need authentication - render directly
  if (isAuthPage) {
    if (hash === 'login') return <Login />;
    if (hash === 'signup') return <Signup />;
    if (hash === 'accept-invite') return <AcceptInvite />;
  }

  // Admin pages
  if (hash === 'team-management') return <TeamManagement />;
  if (hash === 'audit-logs') return <AuditLogs />;

  // Sync URL hash with current page (on first load and hash change)
  useEffect(() => {
    const syncFromHash = () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash && ['portfolio', 'dashboard', 'governance', 'agent-evaluation', 'strike-system', 'threshold-system', 'appeals', 'feedback-loop', 'council', 'public-exceptions', 'regional-adaptation', 'health-metrics'].includes(newHash)) {
        if (newHash !== currentPage) {
          setCurrentPage(newHash as any);
        }
      }
    };

    // Initial sync
    if (isInitialMount.current) {
      syncFromHash();
      isInitialMount.current = false;
    }

    // Listen for hash changes
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [setCurrentPage]);

  // Update hash when page changes (but only if different)
  useEffect(() => {
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash !== currentPage) {
      window.location.hash = currentPage;
    }
  }, [currentPage]);

  // Standalone pages
  if (currentPage === 'governance') {
    return (
      <>
        <Governance />
        <ToastContainer />
      </>
    );
  }

  if (currentPage === 'agent-evaluation') {
    return (
      <>
        <AgentEvaluation />
        <ToastContainer />
      </>
    );
  }

  if (currentPage === 'strike-system') {
    return (
      <>
        <StrikeSystem />
        <ToastContainer />
      </>
    );
  }

  if (currentPage === 'threshold-system') {
    return (
      <>
        <ThresholdSystem />
        <ToastContainer />
      </>
    );
  }

  if (currentPage === 'appeals') {
    return (
      <>
        <Appeals />
        <ToastContainer />
      </>
    );
  }

  if (currentPage === 'feedback-loop') {
    return (
      <>
        <FeedbackLoop />
        <ToastContainer />
      </>
    );
  }

  if (currentPage === 'council') {
    return (
      <>
        <Council />
        <ToastContainer />
      </>
    );
  }

  if (currentPage === 'public-exceptions') {
    return (
      <>
        <PublicExceptions />
        <ToastContainer />
      </>
    );
  }

  if (currentPage === 'regional-adaptation') {
    return (
      <>
        <RegionalAdaptation />
        <ToastContainer />
      </>
    );
  }

  if (currentPage === 'health-metrics') {
    return (
      <>
        <HealthMetrics />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      {currentPage === 'portfolio' ? <Portfolio /> : <ProjectDashboard />}
      <ToastContainer />
    </>
  );
}

export default App;
