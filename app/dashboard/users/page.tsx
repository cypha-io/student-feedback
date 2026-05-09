"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

type Admin = { fullName?: string; email: string; role?: string };

export default function UsersPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState('manager');
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editingFullName, setEditingFullName] = useState('');
  const [editingNewEmail, setEditingNewEmail] = useState('');
  const [editingPassword, setEditingPassword] = useState('');
  const [editingRole, setEditingRole] = useState('manager');

  const fetchAdmins = async () => {
    setLoading(true);
    const res = await fetch('/api/admins');
    const data = await res.json();
    setAdmins(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchAdmins() }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (editingEmail) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [editingEmail]);

  const handleCreate = async () => {
    if (!fullName || !email || !password) return alert('Provide full name, email and password');
    const res = await fetch('/api/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName, email, password, role }) });
    if (res.ok) { setFullName(''); setEmail(''); setPassword(''); fetchAdmins(); }
    else alert('Failed to create admin');
  }

  const handleDelete = async (e: string) => {
    if (!confirm(`Delete admin ${e}?`)) return;
    const res = await fetch(`/api/admins/${encodeURIComponent(e)}`, { method: 'DELETE' });
    if (res.ok) fetchAdmins(); else alert('Failed to delete');
  }

  const startEdit = (admin: Admin) => {
    setEditingEmail(admin.email);
    setEditingFullName(admin.fullName || '');
    setEditingNewEmail(admin.email);
    setEditingPassword('');
    setEditingRole(admin.role || 'manager');
  }

  const handleUpdate = async () => {
    if (!editingEmail || !editingFullName || !editingNewEmail) return alert('Provide full name and email');
    const res = await fetch(`/api/admins/${encodeURIComponent(editingEmail)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: editingFullName,
        email: editingNewEmail,
        password: editingPassword || undefined,
        role: editingRole,
      }),
    });

    if (res.ok) {
      setEditingEmail(null);
      setEditingFullName('');
      setEditingNewEmail('');
      setEditingPassword('');
      setEditingRole('manager');
      fetchAdmins();
    } else {
      const error = await res.json().catch(() => ({}));
      alert(error?.error || 'Failed to update admin');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Administrative Command
            </h2>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Manage system administrators and role-based access permissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 bg-blue-50 border border-blue-100 rounded-2xl">
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{admins.length} Active Admins</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Admin Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 sticky top-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Provision Admin</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" 
                    placeholder="e.g. John Doe" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" 
                    placeholder="john@school.edu" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Token</label>
                  <input 
                    type="password"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" 
                    placeholder="Secure Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Authority Role</label>
                  <select 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer" 
                    value={role} 
                    onChange={e => setRole(e.target.value)}
                  >
                    <option value="superadmin">Super Admin</option>
                    <option value="manager">Department Manager</option>
                    <option value="viewer">Restricted Viewer</option>
                  </select>
                </div>

                <button 
                  className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 hover:shadow-blue-100 mt-4" 
                  onClick={handleCreate}
                >
                  Confirm Provisioning
                </button>
              </div>
            </div>
          </div>

          {/* Admins List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Personnel</h3>
                <span className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-xs font-black text-slate-400">
                  {admins.length}
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                      <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                      <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Authority</th>
                      <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : (
                      admins.map(a => (
                        <tr key={a.email} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="py-6 px-8">
                            <div className="flex items-center gap-4">
                              <div className="w-9 h-9 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-black text-[10px] group-hover:bg-blue-600 group-hover:text-white transition-all">
                                {a.fullName ? a.fullName.charAt(0) : '?'}
                              </div>
                              <div className="font-bold text-slate-900">{a.fullName || 'Unnamed Admin'}</div>
                            </div>
                          </td>
                          <td className="py-6 px-8">
                            <div className="text-xs font-medium text-slate-500">{a.email}</div>
                          </td>
                          <td className="py-6 px-8">
                            <select 
                              defaultValue={a.role || 'manager'} 
                              onChange={async (e) => {
                                const newRole = e.target.value
                                const res = await fetch(`/api/admins/${encodeURIComponent(a.email)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: newRole }) })
                                if (res.ok) fetchAdmins(); else alert('Failed to update role')
                              }} 
                              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-blue-600 focus:ring-0 cursor-pointer p-0"
                            >
                              <option value="superadmin">superadmin</option>
                              <option value="manager">manager</option>
                              <option value="viewer">viewer</option>
                            </select>
                          </td>
                          <td className="py-6 px-8 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                                onClick={() => startEdit(a)}
                                title="Edit Identity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                                onClick={() => handleDelete(a.email)}
                                title="Revoke Access"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
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
        </div>

        {/* Edit Modal */}
        {editingEmail && (
          <div className="fixed inset-0 z-[70] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 sm:p-0">
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setEditingEmail(null)}></div>
              
              <div className="relative bg-white rounded-[3rem] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full border border-white/20 animate-scale-up">
                <div className="px-10 py-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Refine Identity</h3>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Modifying personnel: {editingEmail}</p>
                    </div>
                    <button onClick={() => setEditingEmail(null)} className="w-10 h-10 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Name</label>
                      <input
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        placeholder="Full name"
                        value={editingFullName}
                        onChange={(e) => setEditingFullName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">System Email</label>
                      <input
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        placeholder="Email"
                        value={editingNewEmail}
                        onChange={(e) => setEditingNewEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Update Security Key (Optional)</label>
                      <input
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        placeholder="••••••••"
                        type="password"
                        value={editingPassword}
                        onChange={(e) => setEditingPassword(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Authority Assignment</label>
                      <select 
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer" 
                        value={editingRole} 
                        onChange={(e) => setEditingRole(e.target.value)}
                      >
                        <option value="superadmin">Super Admin</option>
                        <option value="manager">Department Manager</option>
                        <option value="viewer">Restricted Viewer</option>
                      </select>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all" 
                        onClick={() => setEditingEmail(null)}
                      >
                        Abort
                      </button>
                      <button 
                        className="flex-1 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 hover:shadow-blue-100" 
                        onClick={handleUpdate}
                      >
                        Commit Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
