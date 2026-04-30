"use client";
import React, { useEffect, useState } from 'react';

export default function ProjectsView() {
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json())
    ]).then(([projData, userData]) => {
      setProjects(projData.projects || []);
      setUser(userData.user);
      setLoading(false);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/projects', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: desc }),
    });
    const data = await res.json();
    if(res.ok) {
        setProjects([...projects, { ...data.project, owner: user }]);
        setShowModal(false);
        setName(""); setDesc("");
    } else {
        alert(data.error);
    }
  };

  if (loading) return <div className="loading-pulse">Loading projects...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        {user?.role === "ADMIN" && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        )}
      </div>

      <div className="projects-grid" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {projects.length === 0 ? <p>No projects found.</p> : projects.map(p => (
          <div key={p.id} className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{fontSize: '1.25rem', marginBottom: '0.5rem'}}>{p.name}</h3>
            <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1}}>{p.description || "No description"}</p>
            <div style={{fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500}}>Owner: {p.owner?.name}</div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50}}>
          <div className="stat-card" style={{width: '100%', maxWidth: '450px'}}>
            <h2 style={{marginBottom: '1.5rem', fontSize: '1.5rem'}}>Create Project</h2>
            <form onSubmit={handleCreate} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <input className="form-input" placeholder="Project Name" value={name} onChange={e=>setName(e.target.value)} required />
              <textarea className="form-input" placeholder="Description" rows={3} value={desc} onChange={e=>setDesc(e.target.value)} />
              <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
