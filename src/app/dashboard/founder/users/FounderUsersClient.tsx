"use client";

import { motion } from"framer-motion";
import {
 Users, Briefcase, Shield, Search, UserCheck, Mail, Ban,
 CheckCircle, ShieldOff, RefreshCw,
} from"lucide-react";
import { useState, useEffect } from"react";
import { toast } from"sonner";

interface User {
 id: string;
 name: string | null;
 email: string;
 role: string;
 isVerified: boolean;
 isSuspended: boolean;
 createdAt: string;
 _count: {
 gigsPosted: number;
 applications: number;
 };
}

export default function UserManagementPage() {
 const [users, setUsers] = useState<User[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [roleFilter, setRoleFilter] = useState("all");
 const [stats, setStats] = useState({ total: 0, students: 0, clients: 0, founders: 0 });

 useEffect(() => { loadUsers(); }, []);

 const loadUsers = async () => {
 setLoading(true);
 try {
 const res = await fetch("/api/founder/users");
 if (!res.ok) throw new Error("Failed");
 const data = await res.json();
 setUsers(data.users || []);
 setStats(data.stats || { total: 0, students: 0, clients: 0, founders: 0 });
 } catch {
 toast.error("Failed to load users");
 } finally {
 setLoading(false);
 }
 };

 const handleAction = async (userId: string, action: string, label: string) => {
 try {
 const res = await fetch(`/api/founder/users/${userId}`, {
 method:"PATCH",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ action }),
 });
 if (!res.ok) throw new Error("Failed");
 toast.success(`${label} successful`);
 loadUsers();
 } catch {
 toast.error(`${label} failed`);
 }
 };

 const handleDelete = async (user: User) => {
 if (!confirm(`Suspend ${user.email}? This will restrict their access.`)) return;
 handleAction(user.id,"ban","Suspension");
 };

 const filteredUsers = users.filter((u) => {
 const matchSearch = (u.name ||"").toLowerCase().includes(searchQuery.toLowerCase()) ||
 (u.email ||"").toLowerCase().includes(searchQuery.toLowerCase());
 const matchRole = roleFilter ==="all" || u.role === roleFilter;
 return matchSearch && matchRole;
 });

 const roleColors: Record<string, string> = {
 STUDENT:"bg-green-500/20 text-green-400",
 CLIENT:"bg-primary/20 text-primary",
 FOUNDER:"bg-amber-500/20 text-amber-400",
 };

 return (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
 {/* Header */}
 <div>
 <h1 className="md:text-4xl font-black text-white tracking-tight">
 User <span className="text-orange-500">Manager</span>
 </h1>
 <p className="text-slate-500 font-medium mt-1">Search, filter, verify and manage all platform users.</p>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {[
 { label:"Total Users", value: stats.total, icon: Users, color:"text-blue-400 bg-blue-500/10" },
 { label:"Students", value: stats.students, icon: Users, color:"text-green-400 bg-green-500/10" },
 { label:"Clients", value: stats.clients, icon: Briefcase, color:"text-primary bg-primary/10" },
 { label:"Founders", value: stats.founders, icon: Shield, color:"text-amber-400 bg-amber-500/10" },
 ].map((s) => (
 <div key={s.label} className="bg-[#111116] rounded-2xl p-5 shadow-sm">
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
 <s.icon size={20} />
 </div>
 <p className="font-black uppercase tracking-wider text-slate-500">{s.label}</p>
 <p className="font-black text-white">{s.value}</p>
 </div>
 ))}
 </div>

 {/* Filters */}
 <div className="bg-[#111116] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
 <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search by name or email..."
 className="w-full pl-11 pr-4 py-3 bg-white/5 rounded-xl outline-none focus:ring-2 focus:ring-(--primary)/40 text-sm" />
 </div>
 <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
 className="px-4 py-3 bg-white/5 rounded-xl outline-none focus:ring-2 focus:ring-(--primary)/40 text-sm font-medium">
 <option value="all">All Roles</option>
 <option value="STUDENT">Students</option>
 <option value="CLIENT">Clients</option>
 <option value="FOUNDER">Founders</option>
 </select>
 <button onClick={loadUsers} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors" title="Refresh">
 <RefreshCw size={18} className="text-slate-500" />
 </button>
 </div>

 {/* Table */}
 <div className="bg-[#111116] rounded-3xl shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-white/5/60 border-white/10">
 <tr>
 {["User","Role","Activity","Status","Joined","Actions"].map((h) => (
 <th key={h} className="px-6 py-4 font-black text-slate-500 uppercase tracking-wider">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-white/10">
 {loading ? (
 [...Array(5)].map((_, i) => (
 <tr key={i} className="animate-pulse">
 {Array(6).fill(null).map((_, j) => (
 <td key={j} className="px-6 py-4"><div className="h-6 bg-white/5 rounded" /></td>
 ))}
 </tr>
 ))
 ) : filteredUsers.length === 0 ? (
 <tr><td colSpan={6} className="px-6 py-16 text-center">
 <Users size={48} className="mx-auto text-slate-700 mb-3" />
 <p className="text-slate-500 font-medium">No users found</p>
 </td></tr>
 ) : filteredUsers.map((user) => (
 <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
 className={`hover:bg-white/5 transition-colors ${user.isSuspended ?"opacity-60" :""}`}>
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="h-9 w-9 rounded-full bg-(--primary) font-bold flex items-center justify-center text-xs shrink-0">
 {(user.name || user.email).slice(0, 2).toUpperCase()}
 </div>
 <div>
 <p className="font-semibold text-sm">{user.name ||"No Name"}</p>
 <p className="text-slate-500">{user.email}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className={`px-2.5 py-1 rounded-full font-black ${roleColors[user.role] ||"bg-white/5 text-slate-600"}`}>
 {user.role}
 </span>
 </td>
 <td className="px-6 py-4">
 <div className="text-slate-400 space-y-0.5">
 <p>{user._count.gigsPosted} gigs</p>
 <p>{user._count.applications} applications</p>
 </div>
 </td>
 <td className="px-6 py-4">
 <div className="flex flex-col gap-1">
 {user.isVerified && (
 <span className="px-2 py-0.5 bg-blue-500/20 rounded-full text-[10px] font-black w-fit">✓ Verified</span>
 )}
 {user.isSuspended && (
 <span className="px-2 py-0.5 bg-red-500/20 rounded-full text-[10px] font-black w-fit">⊘ Suspended</span>
 )}
 {!user.isVerified && !user.isSuspended && (
 <span className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] font-black w-fit">Active</span>
 )}
 </div>
 </td>
 <td className="px-6 py-4">
 <p className="text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</p>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-1">
 {!user.isVerified ? (
 <button onClick={() => handleAction(user.id,"verify","Verification")}
 title="Verify" className="p-2 hover:bg-green-500/20 rounded-lg transition-colors">
 <UserCheck size={16} className="text-green-600" />
 </button>
 ) : (
 <button onClick={() => handleAction(user.id,"unverify","Unverify")}
 title="Remove Verification" className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors">
 <CheckCircle size={16} className="text-blue-600" />
 </button>
 )}
 <button onClick={() => handleAction(user.id,"email","Email")}
 title="Send Email" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
 <Mail size={16} className="text-slate-500" />
 </button>
 {!user.isSuspended ? (
 <button onClick={() => handleDelete(user)}
 title="Suspend User" className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
 <Ban size={16} className="text-red-500" />
 </button>
 ) : (
 <button onClick={() => handleAction(user.id,"unban","Unsuspend")}
 title="Unsuspend" className="p-2 hover:bg-green-500/20 rounded-lg transition-colors">
 <ShieldOff size={16} className="text-green-600" />
 </button>
 )}
 </div>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}
