import { RequireAdminAuth } from './components/RequireAdminAuth';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { adminToken, guestMode } from './services/admin-api.service';

/**
 * เส้นทางที่โมดูล Admin ดูแล: /admin, /login
 * และหน้าแรก "/" ของคนที่ยังไม่เคยเลือกวิธีเข้าใช้งาน → ไปหน้า login
 */
export function isAdminRoute(pathname = window.location.pathname) {
  if (pathname === '/admin' || pathname === '/login') return true;
  return pathname === '/' && !guestMode.get() && !adminToken.get();
}

export function AdminRoutes() {
  if (window.location.pathname === '/admin') {
    return <RequireAdminAuth>{(user) => <AdminDashboardPage user={user} />}</RequireAdminAuth>;
  }
  return <AdminLoginPage />;
}
