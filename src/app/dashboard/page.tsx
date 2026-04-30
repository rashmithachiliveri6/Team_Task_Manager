"use client";
import React, { useEffect, useState } from 'react';

export default function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data);
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
        <div className="stat-card">
          <div className="stat-title">Total Tasks</div>
          <div className="stat-value">{stats?.total || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">To Do</div>
          <div className="stat-value">{stats?.byStatus?.TODO || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">In Progress</div>
          <div className="stat-value">{stats?.byStatus?.IN_PROGRESS || 0}</div>
        </div>
        <div className="stat-card done">
          <div className="stat-title">Completed</div>
          <div className="stat-value">{stats?.byStatus?.DONE || 0}</div>
        </div>
        <div className="stat-card overdue">
          <div className="stat-title">Overdue Tasks</div>
          <div className="stat-value warning">{stats?.overdue || 0}</div>
        </div>
      </div>
    </>
  );
}
