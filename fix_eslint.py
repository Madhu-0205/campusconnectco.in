import json
import re
import os

with open('eslint-report.json', 'r') as f:
    data = json.load(f)

for file_report in data:
    filepath = file_report['filePath']
    messages = file_report['messages']
    
    # Group messages by line number (descending so we don't mess up line numbers when deleting lines)
    if not messages:
        continue
        
    try:
        with open(filepath, 'r') as f:
            lines = f.readlines()
    except Exception:
        continue
        
    # We will just fix unused variables for now by parsing the message "'X' is defined but never used"
    unused_vars_by_line = {}
    for msg in messages:
        if msg['ruleId'] == '@typescript-eslint/no-unused-vars':
            match = re.search(r"'([^']+)' is defined but never used", msg['message'])
            if match:
                var_name = match.group(1)
                line_idx = msg['line'] - 1
                if line_idx not in unused_vars_by_line:
                    unused_vars_by_line[line_idx] = []
                unused_vars_by_line[line_idx].append(var_name)
    
    # Sort descending
    lines_to_modify = sorted(unused_vars_by_line.keys(), reverse=True)
    
    modified = False
    for line_idx in lines_to_modify:
        vars_to_remove = unused_vars_by_line[line_idx]
        original_line = lines[line_idx]
        new_line = original_line
        
        # This is basic, it might break on multiline imports but works for single line.
        for var in vars_to_remove:
            # Handle import X from 'y'
            new_line = re.sub(rf'\b{var}\b\s*,\s*', '', new_line)
            new_line = re.sub(rf',\s*\b{var}\b', '', new_line)
            new_line = re.sub(rf'\{\{\s*\b{var}\b\s*\}\}', '{}', new_line)
            new_line = re.sub(rf'\{\s*\b{var}\b\s*\}', '{}', new_line)
            # Remove entirely if it's the only import and it's something like import { X } from 'y'
            # But wait, it might be an unused prop like `err` in catch (err).
            # If it's a catch block, replace `catch (err)` with `catch ()` or `catch`
            new_line = re.sub(rf'catch\s*\(\s*\b{var}\b\s*\)', 'catch', new_line)
            
            # If it's a function parameter `(e) =>` replace with `() =>`
            new_line = re.sub(rf'\(\s*\b{var}\b\s*\)\s*=>', '() =>', new_line)
            new_line = re.sub(rf'\(\s*\b{var}\b\s*:\s*[^)]+\)\s*=>', '() =>', new_line)
            
        # Clean up empty import braces
        if re.search(r'import\s*\{\s*\}\s*from', new_line):
            new_line = ""
            
        if new_line != original_line:
            lines[line_idx] = new_line
            modified = True
            
    if modified:
        with open(filepath, 'w') as f:
            f.writelines(lines)
        print(f"Fixed unused vars in {filepath}")

