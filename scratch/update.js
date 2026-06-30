const fs = require('fs');

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace colors
    content = content.replace(/orange-500/g, 'violet-500');
    content = content.replace(/orange-400/g, 'violet-400');
    content = content.replace(/orange-300/g, 'violet-300');
    content = content.replace(/orange-600/g, 'violet-600');
    
    content = content.replace(/amber-500/g, 'cyan-500');
    content = content.replace(/amber-400/g, 'cyan-400');
    content = content.replace(/amber-600/g, 'cyan-600');

    // Replace hex colors with design tokens
    content = content.replace(/bg-\[\#111116\]/g, 'bg-[var(--surface)]');
    content = content.replace(/bg-\[\#1A1A22\]/g, 'bg-[var(--surface-2)]');
    content = content.replace(/bg-\[\#0f0f16\]/g, 'bg-[var(--surface)]');
    content = content.replace(/bg-\[\#14141e\]/g, 'bg-[var(--surface-2)]');
    content = content.replace(/bg-\[\#1c1c2a\]/g, 'bg-[var(--surface-3)]');
    content = content.replace(/bg-\[\#ff4d1c\]/g, 'bg-[var(--primary)]');
    content = content.replace(/hover:bg-\[\#e03e12\]/g, 'hover:bg-[var(--primary-light)]');
    content = content.replace(/rgba\(255,77,28,0\.3\)/g, 'rgba(124,58,237,0.35)');
    content = content.replace(/rgba\(255,77,28,0\.05\)/g, 'rgba(124,58,237,0.1)');
    content = content.replace(/rgba\(251,146,60,0\.8\)/g, 'rgba(139,92,246,0.8)');

    // Common border to design token
    content = content.replace(/border-white\/10/g, 'border-[var(--border)]');
    content = content.replace(/border-white\/5/g, 'border-[var(--border-subtle)]');
    content = content.replace(/hover:border-white\/20/g, 'hover:border-[var(--primary-light)]');
    content = content.replace(/hover:border-white\/30/g, 'hover:border-[var(--primary-light)]');
    content = content.replace(/hover:border-slate-700/g, 'hover:border-[var(--border)]');
    content = content.replace(/border-slate-800/g, 'border-[var(--border-subtle)]');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
}

const files = [
    'src/app/dashboard/student/page.tsx',
    'src/app/dashboard/founder/page.tsx'
];

files.forEach(updateFile);
