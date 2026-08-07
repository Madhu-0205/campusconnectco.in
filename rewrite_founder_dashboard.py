import re
import os

def clean(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

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
        (r'bg-background bg-accent', r'bg-accent'),
        (r'bg-accent bg-accent', r'bg-accent'),
        (r'hover:bg-white hover:bg-accent', r'hover:bg-accent'),
        (r'border-border border-border', r'border-border'),
        (r'bg-white dark:bg-card', r'bg-card'),
        (r'text-muted-foreground hover:text-foreground text-muted-foreground hover:text-foreground', r'text-muted-foreground hover:text-foreground'),
        (r'bg-background text-muted-foreground hover:text-rose-500 bg-accent hover:bg-rose-50 dark:hover:bg-rose-500/10', r'bg-accent text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10'),
        (r'bg-foreground text-background/20', r'bg-foreground text-background'),
        (r'border-white border-border', r'border-border'),
        (r'hover:bg-accent hover:text-foreground hover:bg-accent', r'hover:bg-accent hover:text-foreground'),
        (r'bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400', r'bg-rose-500/10 text-rose-500'),
        (r'border border-slate-100 border-border', r'border border-border'),
        (r'border-slate-100 border-border', r'border-border'),
        (r'text-foreground text-foreground', r'text-foreground'),
        (r'text-muted-foreground text-muted-foreground', r'text-muted-foreground'),
    ]

    for old, new in replacements:
        content = re.sub(old, new, content)

    # Some additional deduplication for safe measure on classNames
    def dedupe(match):
        c = match.group(2)
        words = c.split()
        seen = set()
        out = []
        for w in words:
            if w not in seen:
                seen.add(w)
                out.append(w)
        return match.group(1) + " ".join(out) + match.group(3)
        
    content = re.sub(r'(className=["`\'])(.*?)(["`\'])', dedupe, content)
    
    with open(file_path, 'w') as f:
        f.write(content)

files = [
    'src/app/dashboard/founder/page.tsx',
]

for f in files:
    if os.path.exists(f):
        clean(f)
        
print("Founder dashboard updated.")
