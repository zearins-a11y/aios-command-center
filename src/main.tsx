import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { PersistenceInit } from './components/PersistenceInit';
import { ConflictModal } from './components/SyncButton';
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <PersistenceInit>
        <App />
        <ConflictModal />
      </PersistenceInit>
    </AuthProvider>
  </React.StrictMode>
);
