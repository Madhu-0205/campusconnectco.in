import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Replace hardcoded violet RGB with primary RGB
    content = content.replace('124,58,237', '31,169,113')
    content = content.replace('124, 58, 237', '31, 169, 113')
    
    # Replace hardcoded violet hex with primary hex
    content = content.replace('#7C3AED', '#1FA971')
    content = content.replace('#7c3aed', '#1FA971')
    
    # Replace hardcoded dark backgrounds with tailwind surface classes or variables
    content = content.replace('bg-[#0A0F1E]', 'bg-surface')
    content = content.replace('bg-[#131929]', 'bg-surface')
    content = content.replace('bg-[#0D1120]', 'bg-surface')
    
    # If they are used in style objects
    content = content.replace('#0A0F1E', 'var(--surface)')
    content = content.replace('#131929', 'var(--surface)')
    content = content.replace('#0D1120', 'var(--surface)')
    
    # The browser subagent also found `bg-zinc-950` or similar
    content = re.sub(r'bg-zinc-9[05]0', 'bg-surface', content)
    content = re.sub(r'bg-gray-9[05]0', 'bg-surface', content)
    content = re.sub(r'bg-neutral-9[05]0', 'bg-surface', content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    root_dir = '/Users/madhu/Desktop/campusconnectco.in-main/src'
    modified_count = 0
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith(('.tsx', '.ts')):
                filepath = os.path.join(dirpath, filename)
                if process_file(filepath):
                    modified_count += 1
                    print(f"Modified {filepath}")
    
    print(f"\nTotal files modified: {modified_count}")

if __name__ == '__main__':
    main()
