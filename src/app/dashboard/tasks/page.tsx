"use client";
import React, { useEffect, useState } from 'react';

export default function TasksView() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [taskData, userData] = await Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json())
    ]);
    setTasks(taskData.tasks || []);
    setUser(userData.user);

    if (userData.user?.role === "ADMIN") {
      const [projData, listUsers] = await Promise.all([
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/users').then(r => r.json())
      ]);
      setProjectsList(projData.projects || []);
      setUsersList(listUsers.users || []);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/tasks', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc, projectId, assignedToId, dueDate }),
    });
    const data = await res.json();
    if (res.ok) {
      setShowModal(false);
      setTitle(""); setDesc(""); setProjectId(""); setAssignedToId(""); setDueDate("");
      fetchData();
    } else {
      alert(data.error);
    }
  };

  const updateStatus = async (taskId: string, newStatus: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    }
  };

  if (loading) return <div className="loading-pulse">Loading tasks...</div>;

  const statuses = ["TODO", "IN_PROGRESS", "DONE"];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        {user?.role === "ADMIN" && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Task</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '2rem' }}>
        {statuses.map(status => (
          <div key={status} style={{ flex: 1, minWidth: '300px', backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '1.1rem' }}>
              {status.replace("_", " ")}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task.id} style={{ backgroundColor: 'var(--card-bg)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{task.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{task.description}</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                    <span>Project: {task.project?.name}</span>
                    <span>Assigned: {task.assignedTo?.name || "Unassigned"}</span>
                    {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                  </div>

                  <select 
                    className="form-input" 
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }} 
                    value={task.status} 
                    onChange={e => updateStatus(task.id, e.target.value)}
                    disabled={user.role !== "ADMIN" && task.assignedToId !== user.id}
                  >
                    {statuses.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </div>
              ))}
              {tasks.filter(t => t.status === status).length === 0 && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50}}>
          <div className="stat-card" style={{width: '100%', maxWidth: '450px'}}>
            <h2 style={{marginBottom: '1.5rem', fontSize: '1.5rem'}}>Create Task</h2>
            <form onSubmit={handleCreate} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <input className="form-input" placeholder="Task Title" value={title} onChange={e=>setTitle(e.target.value)} required />
              <textarea className="form-input" placeholder="Description" rows={2} value={desc} onChange={e=>setDesc(e.target.value)} />
              
              <select className="form-input" value={projectId} onChange={e=>setProjectId(e.target.value)} required>
                <option value="">Select Project</option>
                {projectsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <select className="form-input" value={assignedToId} onChange={e=>setAssignedToId(e.target.value)}>
                <option value="">Assign To (Optional)</option>
                {usersList.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>

              <input type="date" className="form-input" value={dueDate} onChange={e=>setDueDate(e.target.value)} />

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
