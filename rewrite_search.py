import re

with open('src/components/search/SearchContent.tsx', 'r') as f:
    content = f.read()

# Replacements
replacements = [
    (r'text-white', r'text-foreground'),
    (r'text-slate-400', r'text-muted-foreground'),
    (r'text-slate-500 dark:text-slate-400', r'text-muted-foreground'),
    (r'text-slate-500', r'text-muted-foreground'),
    (r'text-slate-300 dark:text-slate-700', r'text-muted-foreground/50'),
    (r'text-slate-300', r'text-muted-foreground'),
    (r'bg-\(--surface-2\)', r'bg-surface'),
    (r'border-\(--border\)', r'border-border'),
    (r'text-\(--primary\)', r'text-foreground'), # Or text-primary if preferred, but Apple/Linear prefer monochrome
    (r'bg-\(--primary\)', r'bg-foreground text-background'), 
    (r'ring-\(--primary\)/50', r'ring-ring'),
    (r'hover:text-\(--primary\)', r'hover:opacity-80'),
    (r'bg-slate-100 dark:hover:bg-slate-800', r'hover:bg-accent'),
    (r'dark:hover:bg-slate-800', r'hover:bg-accent'),
    (r'hover:bg-slate-100', r'hover:bg-accent'),
    (r'bg-red-50 dark:bg-red-900/20', r'bg-destructive/10'),
    (r'border-red-200 dark:border-red-800', r'border-destructive/20'),
    (r'text-red-600 dark:text-red-400', r'text-destructive'),
    (r'bg-white/5', r'bg-accent'),
    (r'hover:border-\(--primary\)', r'hover:border-foreground'),
    (r'bg-\(--primary\)/10', r'bg-accent text-foreground'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open('src/components/search/SearchContent.tsx', 'w') as f:
    f.write(content)
