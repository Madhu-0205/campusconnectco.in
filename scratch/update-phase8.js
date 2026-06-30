const fs = require('fs');
const path = require('path');

function processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            updateFile(fullPath);
        }
    }
}

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Colors & Hex
    content = content.replace(/bg-\[\#0A0F1E\]/g, 'bg-background');
    content = content.replace(/bg-\[\#131929\](\/80)?/g, 'bg-[var(--surface)]');
    content = content.replace(/bg-\[\#1A1A22\]/g, 'bg-[var(--surface-2)]');
    content = content.replace(/bg-\[\#111116\]/g, 'bg-[var(--surface)]');
    content = content.replace(/bg-\[\#1c1c2a\]/g, 'bg-[var(--surface-3)]');
    content = content.replace(/bg-white\/5/g, 'bg-[var(--surface-2)]');
    
    // Gradients
    content = content.replace(/from-\[\#7C3AED\] to-\[\#0EA5E9\]/g, 'from-[var(--primary)] to-[var(--accent)]');
    content = content.replace(/bg-\[\#7C3AED\]\/15/g, 'bg-[var(--primary)]/15');
    content = content.replace(/bg-\[\#10B981\]\/10/g, 'bg-[var(--accent)]/10');
    content = content.replace(/text-\[\#A78BFA\]/g, 'text-[var(--primary-light)]');
    content = content.replace(/text-\[\#10B981\]/g, 'text-emerald-500');
    
    // Auth & Dashboards old variables
    content = content.replace(/text-electric/g, 'text-[var(--primary)]');
    content = content.replace(/bg-electric/g, 'bg-[var(--primary)]');
    content = content.replace(/hover:bg-electric-light/g, 'hover:bg-[var(--primary-light)]');
    content = content.replace(/border-electric/g, 'border-[var(--primary)]');
    content = content.replace(/ring-electric/g, 'ring-[var(--primary)]');
    
    // Orange/Amber colors in dashboards
    content = content.replace(/text-orange-500/g, 'text-[var(--primary)]');
    content = content.replace(/bg-orange-500/g, 'bg-[var(--primary)]');
    content = content.replace(/border-orange-500/g, 'border-[var(--primary)]');
    content = content.replace(/text-amber-500/g, 'text-[var(--accent)]');
    content = content.replace(/bg-amber-500/g, 'bg-[var(--accent)]');

    // Slate background replacements
    content = content.replace(/bg-slate-50\b/g, 'bg-background');
    content = content.replace(/dark:bg-slate-950\b/g, 'dark:bg-background');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated ' + filePath);
    }
}

const targetDirs = [
    'src/app/dashboard/student/career-copilot',
    'src/app/dashboard/founder/ai-insights',
    'src/app/dashboard/student/internships',
    'src/app/messages',
    'src/app/notifications',
    'src/components/internships',
    'src/components/ai',
    'src/components/messages',
    'src/components/notifications'
];

targetDirs.forEach(dir => processDirectory(path.join(__dirname, '..', dir)));
