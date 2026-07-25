import { Sparkles, TrendingUp, AlertCircle, Zap } from "lucide-react";
import React from "react";

import { AIInsight } from "@/lib/recommendation-engine";

export function AIInsightsPanel({ insights }: { insights: AIInsight[] }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-[#111127]/60 border border-white/5 rounded-3xl p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-violet-400" />
          AI Career Insights
        </h2>
        <span className="text-xs font-mono text-slate-500 bg-black/40 px-3 py-1 rounded-full border border-white/5">
          Updated Today
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, idx) => {
          let Icon = Zap;
          let bgColor = "bg-violet-600/10";
          let textColor = "text-violet-400";
          let borderColor = "border-violet-500/20";

          if (insight.type === "completion") {
            Icon = AlertCircle;
            bgColor = "bg-amber-500/10";
            textColor = "text-amber-400";
            borderColor = "border-amber-500/20";
          } else if (insight.type === "market_trend") {
            Icon = TrendingUp;
            bgColor = "bg-cyan-500/10";
            textColor = "text-cyan-400";
            borderColor = "border-cyan-500/20";
          } else if (insight.type === "improvement") {
            Icon = AlertCircle;
            bgColor = "bg-rose-500/10";
            textColor = "text-rose-400";
            borderColor = "border-rose-500/20";
          }

          return (
            <div key={idx} className="bg-black/40 border border-white/5 rounded-2xl p-5 flex gap-4 hover:border-white/10 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgColor} ${textColor} border ${borderColor}`}>
                <Icon size={18} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1.5">{insight.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
