import re
import os
import glob

def clean(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    replacements = [
        (r'bg-\(--surface\)', r'bg-card'),
        (r'border-\(--border\)', r'border-border'),
        (r'border-\(--border-subtle\)', r'border-border'),
        (r'bg-\(--primary\)', r'bg-foreground text-background'),
        (r'hover:bg-\(--primary-light\)', r'hover:opacity-90'),
        (r'bg-slate-950', r'bg-background'),
        (r'bg-slate-900', r'bg-background'),
        (r'bg-slate-800', r'bg-card'),
        (r'bg-slate-50 dark:bg-slate-900', r'bg-background'),
        (r'bg-white dark:bg-slate-900', r'bg-background'),
        (r'bg-slate-100 dark:bg-slate-800', r'bg-card'),
        (r'bg-slate-200 dark:bg-slate-700', r'bg-accent'),
        (r'border-slate-800', r'border-border'),
        (r'border-slate-700', r'border-border'),
        (r'border-slate-200 dark:border-slate-800', r'border-border'),
        (r'border-slate-200', r'border-border'),
        (r'border-white/10', r'border-border'),
        (r'dark:bg-card', r'bg-card'),
        (r'dark:bg-slate-900', r'bg-background'),
        (r'dark:bg-slate-800', r'bg-card'),
        (r'dark:text-foreground', r'text-foreground'),
        (r'dark:text-slate-100', r'text-foreground'),
        (r'dark:border-border', r'border-border'),
        (r'dark:border-slate-800', r'border-border'),
        (r'text-slate-900 dark:text-slate-100', r'text-foreground'),
        (r'text-slate-800 dark:text-slate-200', r'text-foreground'),
        (r'text-slate-700 dark:text-slate-300', r'text-muted-foreground'),
        (r'text-slate-600 dark:text-slate-400', r'text-muted-foreground'),
        (r'text-slate-500 dark:text-slate-400', r'text-muted-foreground'),
        (r'text-white', r'text-foreground'),
        (r'text-slate-100', r'text-foreground'),
        (r'text-slate-200', r'text-foreground'),
        (r'text-slate-300', r'text-muted-foreground'),
        (r'text-slate-400', r'text-muted-foreground'),
        (r'text-slate-500', r'text-muted-foreground'),
        (r'text-slate-600', r'text-muted-foreground'),
        (r'text-slate-900', r'text-foreground'),
        (r'text-indigo-400', r'text-foreground'),
        (r'text-violet-400', r'text-foreground'),
        (r'text-purple-400', r'text-foreground'),
        (r'text-cyan-400', r'text-foreground'),
        (r'text-emerald-400', r'text-success'),
        (r'text-blue-500', r'text-foreground'),
        (r'text-blue-600', r'text-foreground'),
        (r'bg-indigo-600', r'bg-foreground text-background'),
        (r'hover:bg-indigo-700', r'hover:bg-foreground/90'),
        (r'bg-violet-600', r'bg-foreground text-background'),
        (r'hover:bg-violet-700', r'hover:bg-foreground/90'),
        (r'bg-blue-600', r'bg-foreground text-background'),
        (r'hover:bg-blue-700', r'hover:bg-foreground/90'),
        (r'bg-indigo-500/10', r'bg-accent'),
        (r'bg-violet-500/10', r'bg-accent'),
        (r'bg-blue-500/10', r'bg-accent'),
        (r'bg-white/5', r'bg-accent'),
        (r'bg-white/10', r'bg-accent'),
        (r'hover:bg-white/20', r'hover:bg-accent/80'),
        (r'border-indigo-500/20', r'border-border'),
        (r'border-violet-500/20', r'border-border'),
        (r'border-blue-500/20', r'border-border'),
        (r'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400', r'text-foreground'),
        (r'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600', r'text-foreground'),
        (r'bg-linear-to-r from-violet-600/5 to-cyan-600/5', r'bg-accent'),
        (r'bg-gradient-to-r from-blue-600 to-indigo-600', r'bg-foreground text-background'),
        (r'shadow-indigo-500/20', r'shadow-sm'),
        (r'shadow-blue-500/25', r'shadow-sm'),
        (r'hover:text-indigo-400', r'hover:text-foreground'),
        (r'hover:text-blue-600', r'hover:text-foreground'),
        (r'ring-indigo-500', r'ring-foreground'),
        (r'focus:border-indigo-500', r'focus:border-foreground'),
        (r'focus:ring-indigo-500/20', r'focus:ring-foreground/20'),
        (r'bg-emerald-500/10', r'bg-success/10 text-success'),
        (r'text-amber-500', r'text-warning'),
        (r'bg-amber-500/10', r'bg-warning/10 text-warning'),
        (r'bg-background bg-accent', r'bg-accent'),
        (r'bg-accent bg-accent', r'bg-accent'),
        (r'hover:bg-white hover:bg-accent', r'hover:bg-accent'),
        (r'border-border border-border', r'border-border'),
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
        (r'bg-white dark:bg-background', r'bg-background'),
        (r'bg-white dark:bg-card', r'bg-card'),
        (r'hover:bg-slate-50 dark:hover:bg-card', r'hover:bg-accent'),
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

# Add all files recursively for ai, messages, gamification, network, auth, leaderboard, settings
folders_to_glob = [
    'src/components/ai/**/*.tsx',
    'src/components/messages/**/*.tsx',
    'src/components/gamification/**/*.tsx',
    'src/components/network/**/*.tsx',
    'src/app/auth/**/*.tsx',
    'src/app/leaderboard/**/*.tsx',
    'src/app/settings/**/*.tsx',
    'src/app/network/**/*.tsx',
    'src/app/messages/**/*.tsx'
]

files = []
for p in folders_to_glob:
    files.extend(glob.glob(p, recursive=True))

# also include specific files like AIChatWidget
for f in files:
    if os.path.exists(f):
        clean(f)
        
print(f"Updated {len(files)} files.")
