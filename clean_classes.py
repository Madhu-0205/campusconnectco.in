import re
import glob
import os

def clean(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Find all className="..." or className={`...`} and remove duplicate words
    def replacer(match):
        prefix = match.group(1)
        classes = match.group(2)
        suffix = match.group(3)
        
        c = classes
        c = c.replace('bg-background bg-accent', 'bg-accent')
        c = c.replace('bg-accent bg-accent', 'bg-accent')
        c = c.replace('hover:bg-white hover:bg-accent', 'hover:bg-accent')
        c = c.replace('border-border border-border', 'border-border')
        c = c.replace('bg-white dark:bg-card', 'bg-card')
        c = c.replace('text-muted-foreground hover:text-foreground text-muted-foreground hover:text-foreground', 'text-muted-foreground hover:text-foreground')
        c = c.replace('bg-background text-muted-foreground hover:text-rose-500 bg-accent hover:bg-rose-50 dark:hover:bg-rose-500/10', 'bg-accent text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10')
        c = c.replace('bg-foreground text-background/20', 'bg-foreground text-background')
        c = c.replace('border-white border-border', 'border-border')
        c = c.replace('hover:bg-accent hover:text-foreground hover:bg-accent', 'hover:bg-accent hover:text-foreground')
        c = c.replace('bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400', 'bg-rose-500/10 text-rose-500')
        c = c.replace('border border-slate-100 border-border', 'border border-border')
        c = c.replace('border-slate-100 border-border', 'border-border')
        c = c.replace('text-foreground text-foreground', 'text-foreground')
        c = c.replace('text-muted-foreground text-muted-foreground', 'text-muted-foreground')
        
        return prefix + c + suffix

    content = re.sub(r'(className=["`\'])(.*?)(["`\'])', replacer, content)

    with open(file_path, 'w') as f:
        f.write(content)

files = glob.glob('src/components/gigs/*.tsx') + [
    'src/app/dashboard/student/page.tsx',
    'src/components/dashboard/AIInsightsPanel.tsx',
    'src/components/dashboard/CareerRoadmapTracker.tsx',
    'src/components/dashboard/RecommendationCard.tsx'
]

for f in files:
    if os.path.exists(f):
        clean(f)
