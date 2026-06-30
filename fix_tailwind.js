const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!dirFile.includes('node_modules') && !dirFile.includes('.next') && !dirFile.includes('.git')) {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync('src');
let totalChanges = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Replace [var(--name)] with (--name) for tailwind classes
  content = content.replace(/([a-z:-]+)-\[var\((--[a-zA-Z0-9-]+)\)\]/g, '$1-($2)');

  // Fix redundant classes
  content = content.replace(/md:p-4 md:p-8/g, 'md:p-8');
  content = content.replace(/md:p-8 md:p-4/g, 'md:p-8');
  content = content.replace(/md:p-8 md:p-12/g, 'md:p-12');
  content = content.replace(/md:p-12 md:p-8/g, 'md:p-12');
  content = content.replace(/md:text-2xl md:text-4xl/g, 'md:text-4xl');
  content = content.replace(/md:text-4xl md:text-2xl/g, 'md:text-4xl');
  content = content.replace(/md:text-4xl md:text-5xl/g, 'md:text-5xl');
  content = content.replace(/md:text-5xl md:text-4xl/g, 'md:text-5xl');
  content = content.replace(/divide-slate-100 divide-white\/10/g, 'divide-white/10');
  content = content.replace(/divide-white\/10 divide-slate-100/g, 'divide-white/10');
  content = content.replace(/bg-white bg-white\/10/g, 'bg-white/10');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
    totalChanges++;
  }
});
console.log('Total files changed:', totalChanges);
