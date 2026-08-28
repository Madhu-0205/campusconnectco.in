import React from"react";

interface EmptyStateProps {
 title: string;
 description: string;
 icon: React.ReactNode;
 action?: React.ReactNode;
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
 return (
 <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm mb-6">
 {icon}
 </div>
 <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
 <p className="text-slate-500 font-medium max-w-sm mb-6">{description}</p>
 {action && <div>{action}</div>}
 </div>
 );
}
