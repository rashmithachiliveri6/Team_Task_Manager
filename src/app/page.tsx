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
        <div className="cta-container">
          <Link href="/login" className="btn btn-primary">Log In</Link>
          <Link href="/register" className="btn btn-secondary">Sign Up</Link>
        </div>
      </header>
    </div>
  );
}
