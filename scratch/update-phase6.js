const fs = require('fs');

function updateFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace typical hex codes
    content = content.replace(/bg-\[\#0A0F1E\]/g, 'bg-background'); // or bg-[var(--bg)]
    content = content.replace(/bg-\[\#111116\]/g, 'bg-[var(--surface)]');
    content = content.replace(/bg-\[\#131929\]\/80/g, 'bg-[var(--surface)]');
    content = content.replace(/bg-\[\#1A1A22\]/g, 'bg-[var(--surface-2)]');
    content = content.replace(/bg-\[\#0f0f16\]/g, 'bg-[var(--surface)]');
    content = content.replace(/bg-\[\#1c1c2a\]/g, 'bg-[var(--surface-3)]');
    content = content.replace(/bg-\[\#ff4d1c\]/g, 'bg-[var(--primary)]');
    content = content.replace(/hover:bg-\[\#e03e12\]/g, 'hover:bg-[var(--primary-light)]');
    
    // Gradients
    content = content.replace(/from-\[\#7C3AED\] to-\[\#0EA5E9\]/g, 'from-violet-600 to-cyan-500');
    content = content.replace(/text-\[\#10B981\]/g, 'text-emerald-500');
    content = content.replace(/bg-\[\#10B981\]/g, 'bg-emerald-500');
    content = content.replace(/border-\[\#10B981\]/g, 'border-emerald-500');
    
    content = content.replace(/text-\[\#0EA5E9\]/g, 'text-cyan-500');
    content = content.replace(/bg-\[\#0EA5E9\]/g, 'bg-cyan-500');
    content = content.replace(/border-\[\#0EA5E9\]/g, 'border-cyan-500');

    content = content.replace(/text-\[\#F59E0B\]/g, 'text-amber-500');
    content = content.replace(/bg-\[\#F59E0B\]/g, 'bg-amber-500');
    content = content.replace(/border-\[\#F59E0B\]/g, 'border-amber-500');
    
    content = content.replace(/text-\[\#7C3AED\]/g, 'text-violet-600');
    content = content.replace(/bg-\[\#7C3AED\]/g, 'bg-violet-600');
    content = content.replace(/hover:bg-\[\#6D28D9\]/g, 'hover:bg-violet-700');

    // Inline CSS vars and string replacements
    content = content.replace(/rgba\(255,77,28,/g, 'rgba(124,58,237,'); // Orange to Violet (primary)
    content = content.replace(/rgba\(255,184,0,/g, 'rgba(6,182,212,'); // Amber to Cyan (accent)

    // Border replacements
    content = content.replace(/border-white\/8/g, 'border-[var(--border)]');
    content = content.replace(/border-white\/10/g, 'border-[var(--border)]');
    content = content.replace(/border-white\/15/g, 'border-[var(--border-subtle)]');
    content = content.replace(/border-white\/20/g, 'border-[var(--border-subtle)]');

    // Generic replacements for GigDetailClient
    content = content.replace(/text-electric/g, 'text-violet-500');
    content = content.replace(/bg-electric/g, 'bg-violet-600');
    content = content.replace(/focus:ring-electric\/50/g, 'focus:ring-violet-500/50');
    content = content.replace(/bg-orange-50/g, 'bg-violet-500/5');
    content = content.replace(/dark:bg-orange-900\/10/g, 'dark:bg-violet-500/10');
    content = content.replace(/bg-orange-100/g, 'bg-violet-500/10');
    content = content.replace(/dark:bg-orange-900\/30/g, 'dark:bg-violet-500/20');
    content = content.replace(/text-orange-600/g, 'text-violet-600');
    content = content.replace(/dark:text-orange-400/g, 'dark:text-violet-400');
    content = content.replace(/text-slate-900/g, 'text-foreground');
    content = content.replace(/dark:text-white/g, 'dark:text-foreground');
    content = content.replace(/text-slate-600/g, 'text-muted-foreground');
    content = content.replace(/dark:text-slate-400/g, 'dark:text-muted-foreground');
    content = content.replace(/bg-slate-50/g, 'bg-background');
    content = content.replace(/dark:bg-slate-950/g, 'dark:bg-background');

    // Fix some profile specific classes
    content = content.replace(/bg-white\/5/g, 'bg-[var(--surface-2)]');
    content = content.replace(/bg-white\/2/g, 'bg-[var(--surface)]');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
}

const files = [
    'src/components/gigs/GigDetailClient.tsx',
    'src/app/profile/page.tsx',
    'src/app/profile/[username]/PublicProfileClient.tsx'
];

files.forEach(updateFile);
