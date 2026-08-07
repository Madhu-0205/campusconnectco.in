import re
import sys

def rewrite(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Replacements for Apple/Linear V2 style
    replacements = [
        (r'bg-\[#111116\]', r'bg-card'),
        (r'bg-\[#0A0A0A\]', r'bg-background'),
        (r'bg-slate-900/80 backdrop-blur-md', r'bg-background/80 backdrop-blur-md'),
        (r'bg-slate-900', r'bg-card'),
        (r'bg-slate-800', r'bg-accent'),
        (r'bg-slate-700', r'bg-accent'),
        (r'bg-slate-950', r'bg-background'),
        (r'border-white/5', r'border-border'),
        (r'border-white/10', r'border-border'),
        (r'border-white/20', r'border-border/80'),
        (r'border-indigo-500/20', r'border-primary/20'),
        (r'bg-white/5', r'bg-accent'),
        (r'bg-white/2', r'bg-accent/50'),
        (r'text-white', r'text-foreground'),
        (r'text-white/70', r'text-muted-foreground'),
        (r'text-white/50', r'text-muted-foreground/80'),
        (r'text-slate-400', r'text-muted-foreground'),
        (r'text-slate-500', r'text-muted-foreground'),
        (r'text-slate-300', r'text-muted-foreground'),
        (r'text-indigo-400', r'text-foreground'),
        (r'bg-indigo-600', r'bg-foreground text-background'),
        (r'hover:bg-indigo-700', r'hover:bg-foreground/90'),
        (r'bg-indigo-500/10', r'bg-accent'),
        (r'shadow-indigo-600/20', r'shadow-sm'),
        (r'shadow-indigo-500/5', r'shadow-sm'),
        (r'shadow-xl', r'shadow-md'),
        (r'hover:text-indigo-400', r'hover:text-foreground'),
    ]

    for old, new in replacements:
        content = re.sub(old, new, content)

    with open(file_path, 'w') as f:
        f.write(content)

rewrite('src/components/gigs/FloatingGigCard.tsx')
rewrite('src/components/gigs/GigDetailClient.tsx')
rewrite('src/components/gigs/BrowseGigsContent.tsx')
