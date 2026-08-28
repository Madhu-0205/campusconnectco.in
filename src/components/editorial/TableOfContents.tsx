import { ListTree } from"lucide-react";
import React from"react";

interface TOCItem {
 id: string;
 title: string;
 level: number;
}

interface TableOfContentsProps {
 content: string; // The markdown content string to parse headers from
}

export function TableOfContents({ content }: TableOfContentsProps) {
 // Simple regex to extract markdown headers (H2 and H3)
 const matches = content.matchAll(/^(##|###)\s+(.+)$/gm);
 const items: TOCItem[] = [];
 
 for (const match of matches) {
 const level = match[1].length; // 2 for ##, 3 for ###
 const title = match[2].trim();
 const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
 
 if (level === 2 || level === 3) {
 items.push({ id, title, level });
 }
 }

 if (items.length === 0) return null;

 return (
 <nav className="bg-surface/60 border border-white/5 rounded-2xl p-5 sticky top-24">
 <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
 <ListTree className="w-4 h-4 text-primary" />
 Table of Contents
 </h3>
 <ul className="space-y-2.5 text-sm">
 {items.map((item, idx) => (
 <li
 key={idx}
 className={`${item.level === 3 ?"pl-4" :""} transition-colors`}
 >
 <a
 href={`#${item.id}`}
 className="text-slate-400 hover:text-cyan-400 block truncate"
 title={item.title}
 >
 {item.title}
 </a>
 </li>
 ))}
 </ul>
 </nav>
 );
}
