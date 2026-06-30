const fs = require('fs');
const path = require('path');

function updateFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');

    // Basic background & surface colors
    content = content.replace(/bg-\[\#0A0F1E\]/g, 'bg-background');
    content = content.replace(/bg-\[\#131929\]/g, 'bg-[var(--surface)]');
    content = content.replace(/bg-\[\#1A1A22\]/g, 'bg-[var(--surface-2)]');
    content = content.replace(/bg-\[\#111116\]/g, 'bg-[var(--surface)]');
    content = content.replace(/bg-white\/5/g, 'bg-[var(--surface-2)]');
    
    // Gradients and specific color codes
    content = content.replace(/from-\[\#7C3AED\] to-\[\#0EA5E9\]/g, 'from-[var(--primary)] to-[var(--accent)]');
    content = content.replace(/bg-\[\#7C3AED\]\/15/g, 'bg-[var(--primary)]/15');
    content = content.replace(/bg-\[\#10B981\]\/10/g, 'bg-[var(--accent)]/10');
    content = content.replace(/text-\[\#A78BFA\]/g, 'text-[var(--primary-light)]');
    content = content.replace(/text-\[\#10B981\]/g, 'text-emerald-500');
    
    // Borders
    content = content.replace(/border-white\/10/g, 'border-[var(--border)]');
    content = content.replace(/border-white\/20/g, 'border-[var(--border-subtle)]');
    
    // Focus rings
    content = content.replace(/focus:border-electric/g, 'focus:border-[var(--primary)]');
    content = content.replace(/focus:ring-electric\/20/g, 'focus:ring-[var(--primary)]/20');
    
    // Text classes
    content = content.replace(/text-slate-300/g, 'text-muted-foreground');
    content = content.replace(/text-slate-400/g, 'text-muted-foreground');
    content = content.replace(/text-slate-500/g, 'text-muted-foreground');

    // Auth forms hardcoded colors
    content = content.replace(/bg-\[\#1A1A22\]/g, 'bg-[var(--surface-2)]');
    content = content.replace(/border-slate-800/g, 'border-[var(--border-subtle)]');
    content = content.replace(/bg-electric/g, 'bg-[var(--primary)]');
    content = content.replace(/hover:bg-electric-light/g, 'hover:bg-[var(--primary-light)]');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
}

const files = [
    'src/app/auth/sign-in/page.tsx',
    'src/app/auth/sign-up/page.tsx',
    'src/app/auth/founder/page.tsx',
    'src/app/auth/forgot-password/page.tsx',
    'src/app/auth/reset-password/page.tsx',
    'src/app/(main)/onboarding/page.tsx',
    'src/components/auth/SignInForm.tsx',
    'src/components/auth/SignUpForm.tsx',
    'src/components/onboarding/OnboardingFlow.tsx'
];

files.forEach(updateFile);
