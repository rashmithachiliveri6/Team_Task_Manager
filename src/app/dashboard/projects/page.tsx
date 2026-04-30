"use client";
import React, { useEffect, useState } from 'react';

export default function ProjectsView() {
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [projRes, authRes] = await Promise.all([
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json())
    ]);
    setProjects(projRes.projects || []);
    setUser(authRes.user);

    if (authRes.user?.role === "ADMIN") {
      const uRes = await fetch('/api/users').then(r => r.json());
      setUsers(uRes.users || []);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/projects', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: desc, startDate, endDate, members: selectedMembers }),
    });
    if(res.ok) {
        setShowModal(false);
        setName(""); setDesc(""); setStartDate(""); setEndDate(""); setSelectedMembers([]);
        fetchData();
    } else {
        const data = await res.json();
        alert(data.error);
    }
  };

  const toggleMember = (id: string) => {
    if (selectedMembers.includes(id)) setSelectedMembers(selectedMembers.filter(m => m !== id));
    else setSelectedMembers([...selectedMembers, id]);
  };

  if (loading) return <div className="loading-pulse">Loading...</div>;

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
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
               <h3 style={{fontSize: '1.25rem'}}>{p.name}</h3>
               <span style={{fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '12px', backgroundColor: p.status === 'COMPLETED' ? 'var(--success)' : 'rgba(255,255,255,0.1)'}}>{p.status}</span>
            </div>
            <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1}}>{p.description || "No description"}</p>
            <div style={{fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500}}>Owner: {p.owner?.name}</div>
            <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>
              Members: {p.members?.map((m:any) => m.user.name).join(", ") || "None"}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50}}>
          <div className="stat-card" style={{width: '100%', maxWidth: '500px'}}>
            <h2 style={{marginBottom: '1.5rem', fontSize: '1.5rem'}}>Create Project</h2>
            <form onSubmit={handleCreate} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <input className="form-input" placeholder="Project Name" value={name} onChange={e=>setName(e.target.value)} required />
              <textarea className="form-input" placeholder="Description" rows={2} value={desc} onChange={e=>setDesc(e.target.value)} />
              
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{flex: 1}}>
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" style={{width: "100%"}} value={startDate} onChange={e=>setStartDate(e.target.value)} />
                </div>
                <div style={{flex: 1}}>
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" style={{width: "100%"}} value={endDate} onChange={e=>setEndDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="form-label" style={{marginBottom: "0.5rem", display: "block"}}>Assign Team Members</label>
                <div style={{display: "flex", flexWrap: "wrap", gap: "0.5rem", maxHeight: "100px", overflowY: "auto", border: "1px solid var(--border-color)", padding: "0.5rem", borderRadius: "var(--radius)"}}>
                   {users.filter(u => u.id !== user.id).map(u => (
                     <label key={u.id} style={{display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", backgroundColor: "var(--bg-color)", padding: "0.25rem 0.5rem", borderRadius: "12px", cursor: "pointer"}}>
                       <input type="checkbox" checked={selectedMembers.includes(u.id)} onChange={() => toggleMember(u.id)} />
                       {u.name}
                     </label>
                   ))}
                   {users.length <= 1 && <span style={{fontSize: "0.85rem", color: "var(--text-muted)"}}>No other users available</span>}
                </div>
              </div>

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
