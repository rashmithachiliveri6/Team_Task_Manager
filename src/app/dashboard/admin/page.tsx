"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, LayoutDashboard, PlusCircle, LogOut, Loader2, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [taskers, setTaskers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard"); // dashboard, create-tasker, assign-task

  // Create Tasker state
  const [newTasker, setNewTasker] = useState({ name: "", email: "", password: "", department: "" });

  // Assign Task state
  const [newTask, setNewTask] = useState({ title: "", description: "", assignedToId: "", projectId: "1", deadline: "", priority: "MEDIUM" });

  useEffect(() => {
    fetchTaskers();
  }, []);

  const fetchTaskers = async () => {
    try {
      const res = await fetch("/api/all-taskers");
      if (res.status === 401 || res.status === 403) router.push("/login/admin");
      const data = await res.json();
      if (data.taskers) setTaskers(data.taskers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleCreateTasker = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/create-tasker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTasker),
    });
    if (res.ok) {
      alert("Tasker created successfully!");
      setNewTasker({ name: "", email: "", password: "", department: "" });
      fetchTaskers();
      setView("dashboard");
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-create a default project if none exists just to fulfill the API requirement
    const projRes = await fetch("/api/create-project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "General Tasks", description: "Default project" }),
    });
    const projData = await projRes.json();
    const projectId = projData.project?.id || newTask.projectId;

    const res = await fetch("/api/assign-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, projectId }),
    });
    if (res.ok) {
      alert("Task assigned successfully!");
      setNewTask({ title: "", description: "", assignedToId: "", projectId: "1", deadline: "", priority: "MEDIUM" });
      fetchTaskers();
      setView("dashboard");
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 border-t"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;

  const totalAssigned = taskers.reduce((acc, t) => acc + t.assigned, 0);
  const totalCompleted = taskers.reduce((acc, t) => acc + t.completed, 0);
  const totalPending = taskers.reduce((acc, t) => acc + t.pending, 0);

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800/50 border-r border-slate-700/50 flex flex-col p-6 hidden md:flex">
        <div className="mb-10 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 tracking-tight">Admin Portal</div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setView("dashboard")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === "dashboard" ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "hover:bg-slate-800 text-slate-400"}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => setView("create-tasker")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === "create-tasker" ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "hover:bg-slate-800 text-slate-400"}`}>
            <Users size={18} /> Add Tasker
          </button>
          <button onClick={() => setView("assign-task")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === "assign-task" ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "hover:bg-slate-800 text-slate-400"}`}>
            <PlusCircle size={18} /> Assign Task
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all mt-auto">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        {view === "dashboard" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm shadow-xl">
                <p className="text-slate-400 text-sm font-medium mb-1">Total Taskers</p>
                <p className="text-3xl font-bold text-white">{taskers.length}</p>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm shadow-xl">
                <p className="text-blue-400 text-sm font-medium mb-1">Total Tasks Assigned</p>
                <p className="text-3xl font-bold text-blue-400">{totalAssigned}</p>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm shadow-xl">
                <p className="text-emerald-400 text-sm font-medium mb-1">Tasks Completed</p>
                <p className="text-3xl font-bold text-emerald-400">{totalCompleted}</p>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm shadow-xl">
                <p className="text-amber-400 text-sm font-medium mb-1">Tasks Pending</p>
                <p className="text-3xl font-bold text-amber-400">{totalPending}</p>
              </div>
            </div>

            {/* Employee Performance Table */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl mt-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Employee Performance <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 font-normal ml-2">{taskers.length} active</span>
                </h2>
                <div className="relative">
                  <input type="text" placeholder="Search taskers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 text-sm text-white rounded-lg focus:outline-none focus:border-blue-500 transition-colors w-full md:w-64" />
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700/50 text-xs uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-4 font-semibold">Name / Email</th>
                      <th className="py-4 px-4 font-semibold">Department</th>
                      <th className="py-4 px-4 font-semibold text-center">Assigned</th>
                      <th className="py-4 px-4 font-semibold text-center text-emerald-400">Completed</th>
                      <th className="py-4 px-4 font-semibold text-center text-amber-400">Pending</th>
                      <th className="py-4 px-4 font-semibold text-center text-red-400">Overdue</th>
                      <th className="py-4 px-4 font-semibold text-right">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {taskers.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.email.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                      <tr><td colSpan={7} className="py-8 text-center text-slate-500">No taskers found.</td></tr>
                    ) : (
                      taskers.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.email.toLowerCase().includes(searchQuery.toLowerCase())).map((t) => (
                        <tr key={t.id} className="hover:bg-slate-700/20 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-medium text-slate-200">{t.name}</div>
                            <div className="text-xs text-slate-500">{t.email}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-slate-700 text-xs font-medium text-slate-300">
                              {t.department || "General"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center font-medium text-slate-300">{t.assigned}</td>
                          <td className="py-4 px-4 text-center font-medium text-emerald-400">{t.completed}</td>
                          <td className="py-4 px-4 text-center font-medium text-amber-400">{t.pending}</td>
                          <td className="py-4 px-4 text-center">
                            {t.overdue > 0 ? (
                              <span className="inline-flex items-center gap-1 text-red-400 font-bold bg-red-400/10 px-2 py-1 rounded-full text-xs">
                                <AlertCircle size={12} /> {t.overdue}
                              </span>
                            ) : (
                              <span className="text-slate-500">0</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${t.efficiency >= 80 ? 'bg-emerald-500' : t.efficiency >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                  style={{ width: `${t.efficiency}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold w-10 text-right">{t.efficiency}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {view === "create-tasker" && (
          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Tasker</h2>
            <form onSubmit={handleCreateTasker} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                <input required type="text" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none" value={newTasker.name} onChange={e => setNewTasker({...newTasker, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                <input required type="email" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none" value={newTasker.email} onChange={e => setNewTasker({...newTasker, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Department</label>
                <input type="text" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Engineering, Design..." value={newTasker.department} onChange={e => setNewTasker({...newTasker, department: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                <input required type="password" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" value={newTasker.password} onChange={e => setNewTasker({...newTasker, password: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors mt-4">Create Tasker Account</button>
            </form>
          </div>
        )}

        {view === "assign-task" && (
          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-white mb-6">Assign Task to Tasker</h2>
            <form onSubmit={handleAssignTask} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Assign To</label>
                <select required className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none" value={newTask.assignedToId} onChange={e => setNewTask({...newTask, assignedToId: e.target.value})}>
                  <option value="" disabled>Select a tasker...</option>
                  {taskers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.department || 'General'})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Task Title</label>
                <input required type="text" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Priority</label>
                  <select required className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Deadline Date</label>
                  <input type="date" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none block" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={!newTask.assignedToId} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed">Dispatch Task</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
