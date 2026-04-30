import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import './dashboard.css';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-brand">Task Manager</div>
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="nav-item">Overview</Link>
          <Link href="/dashboard/projects" className="nav-item">Projects</Link>
          <Link href="/dashboard/tasks" className="nav-item">Tasks</Link>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role}</span>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
