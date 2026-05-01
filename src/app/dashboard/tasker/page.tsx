"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, CheckSquare, MessageSquare, LogOut, Loader2, Calendar, Clock, AlertCircle } from "lucide-react";

export default function TaskerDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ assigned: 0, completed: 0, pending: 0, overdue: 0 });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/mytasks");
      if (res.status === 401 || res.status === 403) router.push("/login/tasker");
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
        calculateMetrics(data.tasks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (taskList: any[]) => {
    const now = new Date();
    setMetrics({
      assigned: taskList.length,
      completed: taskList.filter(t => t.status === "DONE").length,
      pending: taskList.filter(t => t.status === "TODO" || t.status === "IN_PROGRESS").length,
      overdue: taskList.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== "DONE").length
    });
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/update-task-status/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchTasks();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleAddComment = async (taskId: string) => {
    const text = prompt("Enter your comment:");
    if (!text) return;
    try {
      await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      fetchTasks();
    } catch (error) {
      alert("Failed to add comment");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const statusColors: any = {
    "TODO": "bg-slate-700 text-slate-300",
    "IN_PROGRESS": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    "DONE": "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
  };

  const priorityColors: any = {
    "LOW": "text-slate-400",
    "MEDIUM": "text-blue-400 font-medium",
    "HIGH": "text-red-400 font-bold"
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f172a]"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/60 border-r border-slate-700/50 flex flex-col p-6 hidden md:flex backdrop-blur-xl">
        <div className="mb-10 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 tracking-tight">Workspace</div>
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <LayoutDashboard size={18} /> My Tasks
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all mt-auto border border-transparent hover:border-red-500/20">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">My Tasks</h1>
              <p className="text-slate-400 mt-1">Manage your responsibilities and track progress.</p>
            </div>
          </header>
          
          {/* Progress Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm shadow-xl">
              <p className="text-slate-400 text-sm font-medium mb-1">Total Assigned</p>
              <p className="text-3xl font-bold text-white">{metrics.assigned}</p>
            </div>
            <div className="bg-slate-800/40 border border-emerald-500/30 p-6 rounded-2xl backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><CheckSquare size={48} className="text-emerald-500" /></div>
              <p className="text-emerald-400 text-sm font-medium mb-1 relative z-10">Completed</p>
              <p className="text-3xl font-bold text-emerald-400 relative z-10">{metrics.completed}</p>
            </div>
            <div className="bg-slate-800/40 border border-blue-500/30 p-6 rounded-2xl backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={48} className="text-blue-500" /></div>
              <p className="text-blue-400 text-sm font-medium mb-1 relative z-10">In Progress</p>
              <p className="text-3xl font-bold text-blue-400 relative z-10">{metrics.pending}</p>
            </div>
            <div className={`bg-slate-800/40 border ${metrics.overdue > 0 ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-900/10' : 'border-slate-700/50'} p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden transition-all delay-100`}>
              {metrics.overdue > 0 && <div className="absolute top-0 right-0 p-4 opacity-10"><AlertCircle size={48} className="text-red-500" /></div>}
              <p className={`${metrics.overdue > 0 ? 'text-red-400' : 'text-slate-400'} text-sm font-medium mb-1 relative z-10`}>Overdue</p>
              <p className={`text-3xl font-bold ${metrics.overdue > 0 ? 'text-red-400' : 'text-slate-400'} relative z-10`}>{metrics.overdue}</p>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Action Items
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">{tasks.length}</span>
            </h2>
            
            {tasks.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/20 border border-slate-700/30 rounded-2xl border-dashed">
                <CheckSquare size={40} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">You have no tasks assigned to you right now.</p>
                <p className="text-slate-500 text-sm mt-1">Enjoy your day or ask your admin for new tasks!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <div key={task.id} className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col transition-all hover:-translate-y-1 hover:border-emerald-500/30">
                    <div className="flex justify-between items-start mb-4">
                      <select 
                        value={task.status} 
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer appearance-none outline-none transition-colors ${statusColors[task.status]}`}
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="DONE">DONE</option>
                      </select>
                      <span className={`text-xs uppercase tracking-wider ${priorityColors[task.priority]}`}>
                        {task.priority || "MEDIUM"}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-emerald-400 transition-colors">{task.title}</h3>
                    <p className="text-slate-400 text-sm flex-1 mb-6 break-words line-clamp-3">{task.description || "No description provided."}</p>
                    
                    <div className="pt-4 border-t border-slate-700/50 space-y-3">
                      <div className="flex items-center text-xs text-slate-400">
                        <span className="opacity-70 mr-1">Assigned by </span> 
                        <span className="font-medium text-slate-300">{task.assignedBy?.name || "System"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar size={14} className={task.deadline && new Date(task.deadline) < new Date() && task.status !== "DONE" ? "text-red-400" : ""} />
                          <span className={task.deadline && new Date(task.deadline) < new Date() && task.status !== "DONE" ? "text-red-400 font-semibold" : ""}>
                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleAddComment(task.id)}
                          className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1 bg-emerald-400/10 rounded-md transition-colors"
                        >
                          <MessageSquare size={14} /> Add Comment
                          {task.comments?.length > 0 && <span className="ml-1 bg-emerald-500/20 px-1.5 rounded text-[10px]">{task.comments.length}</span>}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
