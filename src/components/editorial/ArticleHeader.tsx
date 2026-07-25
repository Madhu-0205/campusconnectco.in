import { Calendar, Clock } from "lucide-react";
import Image from "next/image";
import React from "react";

import { Author } from "@/lib/content-engine/types";

interface ArticleHeaderProps {
  title: string;
  description: string;
  author: Author;
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  category: string;
}

export function ArticleHeader({
  title,
  description,
  author,
  publishedAt,
  updatedAt,
  readingTimeMinutes,
  category,
}: ArticleHeaderProps) {
  const publishedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  
  const updatedDate = new Date(updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="space-y-6 border-b border-white/5 pb-8 mb-8">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/20 bg-violet-600/5 text-violet-400 text-xs font-black uppercase tracking-widest font-mono">
        {category.replace("-", " ")}
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight font-heading">
        {title}
      </h1>
      
      <p className="text-slate-400 max-w-3xl text-lg md:text-xl leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <Image
            src={author.avatarUrl}
            alt={author.name}
            width={40}
            height={40}
            className="rounded-full bg-slate-800"
          />
          <div>
            <p className="text-sm font-bold text-white">{author.name}</p>
            <p className="text-xs text-slate-400">{author.role}</p>
          </div>
        </div>

        <div className="h-8 w-px bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Updated: {updatedDate}</span>
            {publishedDate !== updatedDate && (
              <span className="hidden md:inline text-slate-600 ml-1">
                (Originally published {publishedDate})
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{readingTimeMinutes} min read</span>
          </div>
        </div>
      </div>
    </header>
  );
}
