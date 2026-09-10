import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { PersistenceInit } from './components/PersistenceInit';
import { ConflictModal } from './components/SyncButton';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <PermissionsProvider>
        <PersistenceInit>
          <App />
          <ConflictModal />
        </PersistenceInit>
      </PermissionsProvider>
    </AuthProvider>
  </React.StrictMode>
);
