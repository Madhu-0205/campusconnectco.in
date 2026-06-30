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
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Search Page & General
    content = content.replace(/bg-slate-50 dark:bg-slate-950/g, 'bg-background');
    content = content.replace(/bg-white dark:bg-slate-900/g, 'bg-[var(--surface-2)]');
    content = content.replace(/border-slate-300 dark:border-slate-700/g, 'border-[var(--border)]');
    content = content.replace(/text-slate-900 dark:text-white/g, 'text-white');
    content = content.replace(/text-slate-600 dark:text-slate-400/g, 'text-slate-400');
    content = content.replace(/text-electric/g, 'text-[var(--primary)]');
    content = content.replace(/bg-electric/g, 'bg-[var(--primary)]');
    content = content.replace(/border-electric\/(\d+)/g, 'border-[var(--primary)]/$1');
    content = content.replace(/shadow-electric\/(\d+)/g, 'shadow-[var(--primary)]/$1');
    content = content.replace(/ring-electric\/(\d+)/g, 'ring-[var(--primary)]/$1');
    content = content.replace(/hover:text-electric/g, 'hover:text-[var(--primary-light)]');
    content = content.replace(/hover:border-electric/g, 'hover:border-[var(--primary)]');
    content = content.replace(/bg-slate-100 dark:bg-slate-800/g, 'bg-white/5');
    content = content.replace(/text-slate-700 dark:text-slate-300/g, 'text-slate-300');
    
    // Responsiveness
    // padding 8 -> p-4 md:p-8
    content = content.replace(/\bp-8\b/g, 'p-4 md:p-8');
    // gap 8 -> gap-4 md:gap-8
    content = content.replace(/\bgap-8\b/g, 'gap-4 md:gap-8');
    // text-4xl -> text-2xl md:text-4xl
    content = content.replace(/\btext-4xl\b/g, 'text-2xl md:text-4xl');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}

['src/app/auth', 'src/components/Search', 'src/app/search', 'src/app/dashboard'].forEach(processDirectory);
