import Link from "next/link";
import "./page.css";

export default function Home() {
  return (
    <div className="home-container">
      <header className="hero">
        <h1 className="hero-title">Welcome to Team Task Manager</h1>
        <p className="hero-subtitle">
          Manage your team projects and track progress efficiently.
        </p>
        <div className="cta-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/login" className="btn btn-primary" style={{ minWidth: '120px', textAlign: 'center' }}>Log In</Link>
            <Link href="/register" className="btn btn-secondary" style={{ minWidth: '120px', textAlign: 'center' }}>Sign Up</Link>
          </div>
          <Link href="/register/admin" className="admin-link" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'underline' }}>Login as an Admin</Link>
        </div>
      </header>
    </div>
  );
}
