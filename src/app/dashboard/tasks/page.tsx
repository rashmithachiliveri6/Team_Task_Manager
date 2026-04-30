"use client";
import React, { useEffect, useState, useRef } from 'react';

export default function KanbanTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewTask, setViewTask] = useState<any>(null);
  
  // Form States
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [deadline, setDeadline] = useState("");
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [tRes, uRes] = await Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json())
    ]);
    setTasks(tRes.tasks || []);
    setUser(uRes.user);

    if (uRes.user?.role === "ADMIN") {
      const [pData, lUsers] = await Promise.all([
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/users').then(r => r.json())
      ]);
      setProjectsList(pData.projects || []);
      setUsersList(lUsers.users || []);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/tasks', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc, projectId, assignedToId, priority, deadline }),
    });
    if (res.ok) {
      setShowCreateModal(false);
      setTitle(""); setDesc(""); setProjectId(""); setAssignedToId(""); setPriority("MEDIUM"); setDeadline("");
      fetchData();
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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("taskId", id);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== newStatus && (user.role === "ADMIN" || task.assignedToId === user.id)) {
        updateStatus(taskId, newStatus);
      }
    }
  };

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !viewTask) return;
    const res = await fetch(`/api/tasks/${viewTask.id}/comments`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ text: newComment })
    });
    if (res.ok) {
      const data = await res.json();
      setViewTask({...viewTask, comments: [data.comment, ...(viewTask.comments || [])]});
      setNewComment("");
      fetchData();
    }
  };

  if (loading) return <div className="loading-pulse">Loading tasks...</div>;

  const statuses = ["TODO", "IN_PROGRESS", "DONE"];
  const getPriorityColor = (p: string) => p==="HIGH" ? "var(--error)" : p==="MEDIUM" ? "var(--primary)" : "var(--success)";

  return (
    <div style={{height: "100%", display: "flex", flexDirection: "column"}}>
      <div className="page-header">
        <h1 className="page-title">Tasks Board</h1>
        {user?.role === "ADMIN" && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ New Task</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflowX: 'auto', paddingBottom: '1rem' }}>
        {statuses.map(status => (
          <div 
            key={status} 
            onDragOver={e => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
            style={{ flex: 1, minWidth: '320px', backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}
          >
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)' }}>
              {status.replace("_", " ")} ({tasks.filter(t => t.status === status).length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              {tasks.filter(t => t.status === status).map(task => (
                <div 
                  key={task.id} 
                  draggable={user.role === "ADMIN" || task.assignedToId === user.id}
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => setViewTask(task)}
                  style={{ backgroundColor: 'var(--bg-color)', padding: '1.25rem', borderRadius: 'var(--radius)', border: `1px solid ${getPriorityColor(task.priority)}50`, cursor: 'grab' }}
                >
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>{task.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{task.description?.substring(0, 50)}...</p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <span style={{color: getPriorityColor(task.priority)}}>{task.priority}</span>
                    <span style={{backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px'}}>👤 {task.assignedTo?.name || "Unassigned"}</span>
                    <span style={{backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px'}}>💬 {task.comments?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50}}>
          <div className="stat-card" style={{width: '100%', maxWidth: '500px'}}>
             {/* Same form markup basically... */}
            <h2 style={{marginBottom: '1.5rem', fontSize: '1.5rem'}}>Create Task</h2>
            <form onSubmit={handleCreate} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <input className="form-input" placeholder="Task Title" value={title} onChange={e=>setTitle(e.target.value)} required />
              <textarea className="form-input" placeholder="Description" rows={2} value={desc} onChange={e=>setDesc(e.target.value)} />
              <select className="form-input" value={projectId} onChange={e=>setProjectId(e.target.value)} required>
                <option value="">Select Project</option>
                {projectsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <div style={{display: "flex", gap: "1rem"}}>
                <select className="form-input" style={{flex: 1}} value={assignedToId} onChange={e=>setAssignedToId(e.target.value)}>
                  <option value="">Assign To...</option>
                  {usersList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <select className="form-input" style={{flex: 1}} value={priority} onChange={e=>setPriority(e.target.value)}>
                  <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                </select>
              </div>
              <input type="date" className="form-input" value={deadline} onChange={e=>setDeadline(e.target.value)} />
              <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewTask && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50}}>
          <div className="stat-card" style={{width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', maxHeight: '90vh'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
              <h2 style={{fontSize: '1.5rem'}}>{viewTask.title}</h2>
              <button onClick={() => setViewTask(null)} style={{fontSize: '1.5rem', color: 'var(--text-muted)'}}>&times;</button>
            </div>
            
            <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>{viewTask.description}</p>
            
            <h3 style={{marginBottom: '0.5rem'}}>Activity & Comments</h3>
            <div style={{flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
               {viewTask.comments?.map((c:any) => (
                 <div key={c.id} style={{backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px'}}>
                    <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>{c.user?.name} - {new Date(c.createdAt).toLocaleString()}</div>
                    <div>{c.text}</div>
                 </div>
               ))}
               {(!viewTask.comments || viewTask.comments.length === 0) && <p style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>No comments yet.</p>}
            </div>

            <form onSubmit={addComment} style={{display: 'flex', gap: '0.5rem'}}>
              <input className="form-input" style={{flex: 1}} placeholder="Write a comment..." value={newComment} onChange={e=>setNewComment(e.target.value)} required />
              <button type="submit" className="btn btn-primary">Post</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
