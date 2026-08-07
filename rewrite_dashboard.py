import re
import os
import glob

def clean(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Replacements for unified V2 style
    replacements = [
        (r'bg-\(--surface\)', r'bg-card'),
        (r'border-\(--border\)', r'border-border'),
        (r'border-\(--border-subtle\)', r'border-border'),
        (r'bg-\(--primary\)', r'bg-foreground text-background'),
        (r'hover:bg-\(--primary-light\)', r'hover:opacity-90'),
        (r'text-white', r'text-foreground'),
        (r'text-slate-100', r'text-foreground'),
        (r'text-slate-200', r'text-foreground'),
        (r'text-slate-300', r'text-muted-foreground'),
        (r'text-slate-400', r'text-muted-foreground'),
        (r'text-slate-500', r'text-muted-foreground'),
        (r'text-slate-600', r'text-muted-foreground'),
        (r'text-slate-900', r'text-foreground'),
        (r'bg-slate-900', r'bg-background'),
        (r'bg-slate-800', r'bg-card'),
        (r'border-slate-800', r'border-border'),
        (r'border-slate-700', r'border-border'),
        (r'dark:bg-card', r'bg-card'),
        (r'dark:text-foreground', r'text-foreground'),
        (r'dark:border-border', r'border-border'),
        (r'text-violet-400', r'text-foreground'),
        (r'text-purple-400', r'text-foreground'),
        (r'text-cyan-400', r'text-foreground'),
        (r'text-emerald-400', r'text-success'),
        (r'text-indigo-400', r'text-foreground'),
        (r'text-transparent bg-linear-to-r from-violet-400 to-cyan-400', r'text-foreground'),
        (r'text-transparent bg-linear-to-r from-violet-400 to-indigo-400', r'text-foreground'),
        (r'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600', r'text-foreground'),
        (r'bg-violet-500/10', r'bg-accent'),
        (r'bg-purple-500/10', r'bg-accent'),
        (r'bg-cyan-500/10', r'bg-accent'),
        (r'bg-emerald-500/10', r'bg-success/10'),
        (r'border-violet-500/20', r'border-border'),
        (r'border-purple-500/20', r'border-border'),
        (r'border-cyan-500/20', r'border-border'),
        (r'border-emerald-500/20', r'border-success/20'),
        (r'group-hover:bg-violet-500/20', r'group-hover:bg-accent'),
        (r'group-hover:bg-purple-500/20', r'group-hover:bg-accent'),
        (r'group-hover:bg-emerald-500/20', r'group-hover:bg-success/20'),
        (r'bg-white/5', r'bg-accent'),
        (r'bg-white/10', r'bg-accent'),
        (r'hover:bg-white/20', r'hover:bg-accent/80'),
        (r'style={{ fontFamily: "var\(--font-display\)" }}', r''),
        (r'style={{ boxShadow: "0 0 28px rgba\(124,58,237,0.35\)" }}', r''),
        (r'style=\{\{\s*\}\}', r''),
        (r'bg-linear-to-r from-violet-600/5 to-cyan-600/5', r'bg-accent/30'),
    ]

    for old, new in replacements:
        content = re.sub(old, new, content)

    with open(file_path, 'w') as f:
        f.write(content)

# Apply to student dashboard and components
files = [
    'src/app/dashboard/student/page.tsx',
    'src/components/dashboard/AIInsightsPanel.tsx',
    'src/components/dashboard/CareerRoadmapTracker.tsx',
    'src/components/dashboard/RecommendationCard.tsx'
]

for f in files:
    if os.path.exists(f):
        clean(f)

print("Dashboard rewrites complete!")
