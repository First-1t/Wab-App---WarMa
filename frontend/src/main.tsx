import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AdminRoutes, isAdminRoute } from './features/admin/AdminRoutes';
import { PublicAdminEntry } from './features/admin/components/PublicAdminEntry';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      {isAdminRoute() ? (
        <AdminRoutes />
      ) : (
        <>
          <App />
          <PublicAdminEntry />
        </>
      )}
    </StrictMode>,
  );
}
