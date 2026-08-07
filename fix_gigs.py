import re
import os
import glob

def fix(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Replacements for unified V2 style
    replacements = [
        (r'bg-slate-50 dark:bg-accent', r'bg-accent'),
        (r'bg-slate-50', r'bg-background'),
        (r'bg-slate-100', r'bg-accent'),
        (r'bg-slate-200', r'bg-accent'),
        (r'text-slate-900 dark:text-foreground', r'text-foreground'),
        (r'text-slate-800 dark:text-foreground', r'text-foreground'),
        (r'text-slate-700 dark:text-muted-foreground', r'text-muted-foreground'),
        (r'text-slate-600 dark:text-muted-foreground', r'text-muted-foreground'),
        (r'text-slate-500 dark:text-muted-foreground', r'text-muted-foreground'),
        (r'text-slate-900', r'text-foreground'),
        (r'text-slate-800', r'text-foreground'),
        (r'text-slate-700', r'text-muted-foreground'),
        (r'text-slate-600', r'text-muted-foreground'),
        (r'border-slate-200 dark:border-slate-700', r'border-border'),
        (r'border-slate-200', r'border-border'),
        (r'border-slate-700', r'border-border'),
        (r'border-slate-800', r'border-border'),
        (r'dark:text-foreground', r'text-foreground'),
        (r'dark:text-muted-foreground', r'text-muted-foreground'),
        (r'dark:border-border', r'border-border'),
        (r'dark:bg-accent', r'bg-accent'),
        (r'dark:hover:bg-accent', r'hover:bg-accent'),
        (r'dark:hover:text-foreground', r'hover:text-foreground'),
        (r'dark:hover:text-muted-foreground', r'hover:text-muted-foreground'),
        (r'hover:text-slate-900', r'hover:text-foreground'),
        (r'hover:text-slate-700', r'hover:text-foreground'),
        (r'bg-accent0', r'bg-background'),
        (r'bg-electric/10', r'bg-accent text-foreground'),
        (r'text-electric', r'text-foreground'),
        (r'bg-electric', r'bg-foreground text-background'),
        (r'shadow-electric/20', r'shadow-sm'),
        (r'hover:bg-blue-600', r'hover:opacity-90'),
        (r'text-amber-500', r'text-warning'),
        (r'text-emerald-500', r'text-success'),
    ]

    for old, new in replacements:
        content = re.sub(old, new, content)

    with open(file_path, 'w') as f:
        f.write(content)

for f in glob.glob('src/components/gigs/*.tsx'):
    fix(f)
