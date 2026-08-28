"use client";

import { Users, Loader2 } from"lucide-react";
import { useState, useEffect } from"react";
import { toast } from"sonner";

import { Card } from"@/components/ui/Card";
import EmptyState from"@/components/ui/EmptyState";

type Student = {
 id: string;
 name: string | null;
 email: string;
 branch: string | null;
 year: string | null;
 isVerified: boolean;
};

export default function CollegeStudentsPage() {
 const [students, setStudents] = useState<Student[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchStudents = async () => {
 try {
 const res = await fetch("/api/college/students");
 if (!res.ok) throw new Error("Failed to fetch students");
 const data = await res.json();
 setStudents(data.students || []);
 } catch (error) {
 console.error(error);
 toast.error("Error loading students");
 } finally {
 setLoading(false);
 }
 };
 fetchStudents();
 }, []);

 return (
 <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
 <div className="flex flex-col gap-2">
 <div className="flex items-center gap-2">
 <span className="w-8 h-1 bg-primary rounded-full" />
 <span className="font-bold text-primary uppercase tracking-widest">Directory</span>
 </div>
 <h1 className="font-black text-3xl md:text-5xl text-slate-900 tracking-tight">
 Enrolled Students
 </h1>
 <p className="text-slate-500 font-medium text-lg">
 Manage and view all students from your institution.
 </p>
 </div>

 {loading ? (
 <div className="flex justify-center p-12">
 <Loader2 className="w-8 h-8 animate-spin text-primary" />
 </div>
 ) : students.length === 0 ? (
 <EmptyState 
 title="No Students Found"
 description="It looks like no students have registered under your college yet."
 icon={<Users size={32} />}
 />
 ) : (
 <Card className="border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-slate-50/50 border-b border-slate-100">
 <tr>
 <th className="px-6 py-4 text-left font-bold text-slate-700">Name</th>
 <th className="px-6 py-4 text-left font-bold text-slate-700">Email</th>
 <th className="px-6 py-4 text-left font-bold text-slate-700">Branch</th>
 <th className="px-6 py-4 text-left font-bold text-slate-700">Year</th>
 <th className="px-6 py-4 text-left font-bold text-slate-700">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {students.map(student => (
 <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
 <td className="px-6 py-4 font-medium text-slate-900">{student.name ||"Unknown"}</td>
 <td className="px-6 py-4 text-slate-600">{student.email}</td>
 <td className="px-6 py-4 text-slate-600">{student.branch ||"-"}</td>
 <td className="px-6 py-4 text-slate-600">{student.year ||"-"}</td>
 <td className="px-6 py-4">
 {student.isVerified ? (
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
 Verified
 </span>
 ) : (
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
 Pending
 </span>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 )}
 </div>
 );
}
