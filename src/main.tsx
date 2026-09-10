import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { PersistenceInit } from './components/PersistenceInit';
import { ConflictModal } from './components/SyncButton';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PersistenceInit>
      <App />
      <ConflictModal />
    </PersistenceInit>
  </React.StrictMode>
);
