"use client";
import React, { useEffect, useState } from 'react';

export default function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/projects').then(r => r.json())
    ]).then(([sData, pData]) => {
        setStats(sData);
        setProjects(pData.projects || []);
        setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-pulse">Loading dashboard...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-title">Total Tasks</div><div className="stat-value">{stats?.total || 0}</div></div>
        <div className="stat-card"><div className="stat-title">Pending</div><div className="stat-value">{stats?.byStatus?.TODO || 0}</div></div>
        <div className="stat-card done"><div className="stat-title">Completed</div><div className="stat-value">{stats?.byStatus?.DONE || 0}</div></div>
        <div className="stat-card overdue"><div className="stat-title">Overdue</div><div className="stat-value warning">{stats?.overdue || 0}</div></div>
      </div>

      <h2 style={{fontSize: "1.5rem", marginBottom: "1.5rem"}}>Project Progress</h2>
      <div style={{display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))"}}>
        {projects.map(p => (
          <div key={p.id} className="stat-card" style={{padding: "1.5rem"}}>
            <div style={{display: "flex", justifyContent: "space-between", marginBottom: "1rem"}}>
               <strong style={{fontSize: "1.2rem"}}>{p.name}</strong> 
               <span style={{color: "var(--primary)", fontWeight: "bold"}}>{p.progress}%</span>
            </div>
            <div style={{width: "100%", height: "8px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden"}}>
               <div style={{width: `${p.progress}%`, height: "100%", background: "linear-gradient(90deg, var(--primary), var(--primary-hover))", transition: "width 1s ease"}}></div>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p>No active projects.</p>}
      </div>
    </>
  );
}
