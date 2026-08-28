import os
import re
import sys

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Strip all `dark:` classes
    content = re.sub(r'dark:[a-zA-Z0-9\-\/\[\]\.]+\s?', '', content)

    # 2. Map Backgrounds
    content = content.replace('bg-[#111127]', 'bg-surface')
    content = content.replace('bg-slate-900', 'bg-surface-2')
    content = content.replace('bg-slate-800', 'bg-surface-3')
    
    # 3. Map Violet/Purple/Indigo to Primary Green
    # Violet
    content = re.sub(r'text-violet-400', 'text-primary', content)
    content = re.sub(r'text-violet-[0-9]+', 'text-primary', content)
    content = re.sub(r'bg-violet-[0-9]+/([0-9]+)', r'bg-primary/\1', content)
    content = re.sub(r'bg-violet-[0-9]+', 'bg-primary', content)
    content = re.sub(r'border-violet-[0-9]+/([0-9]+)', r'border-primary/\1', content)
    content = re.sub(r'border-violet-[0-9]+', 'border-primary', content)
    content = re.sub(r'shadow-violet-[0-9]+/([0-9]+)', r'shadow-primary/\1', content)
    content = re.sub(r'from-violet-[0-9]+', 'from-primary', content)
    content = re.sub(r'to-violet-[0-9]+', 'to-primary-light', content)
    content = re.sub(r'ring-violet-[0-9]+', 'ring-primary', content)
    
    # Indigo
    content = re.sub(r'text-indigo-[0-9]+', 'text-primary', content)
    content = re.sub(r'bg-indigo-[0-9]+/([0-9]+)', r'bg-primary/\1', content)
    content = re.sub(r'bg-indigo-[0-9]+', 'bg-primary', content)
    content = re.sub(r'border-indigo-[0-9]+/([0-9]+)', r'border-primary/\1', content)
    content = re.sub(r'border-indigo-[0-9]+', 'border-primary', content)
    content = re.sub(r'shadow-indigo-[0-9]+/([0-9]+)', r'shadow-primary/\1', content)
    content = re.sub(r'from-indigo-[0-9]+', 'from-primary', content)
    content = re.sub(r'to-indigo-[0-9]+', 'to-primary-light', content)
    content = re.sub(r'ring-indigo-[0-9]+', 'ring-primary', content)

    # Purple
    content = re.sub(r'text-purple-[0-9]+', 'text-primary', content)
    content = re.sub(r'bg-purple-[0-9]+/([0-9]+)', r'bg-primary/\1', content)
    content = re.sub(r'bg-purple-[0-9]+', 'bg-primary', content)
    content = re.sub(r'border-purple-[0-9]+/([0-9]+)', r'border-primary/\1', content)
    content = re.sub(r'border-purple-[0-9]+', 'border-primary', content)
    content = re.sub(r'shadow-purple-[0-9]+/([0-9]+)', r'shadow-primary/\1', content)
    content = re.sub(r'from-purple-[0-9]+', 'from-primary', content)
    content = re.sub(r'to-purple-[0-9]+', 'to-primary-light', content)
    content = re.sub(r'ring-purple-[0-9]+', 'ring-primary', content)
    
    # 4. Clean up cyan/gradient artifacts commonly used with violet
    content = re.sub(r'from-cyan-[0-9]+', 'from-primary-light', content)
    content = re.sub(r'to-cyan-[0-9]+', 'to-primary', content)
    
    # 5. Fix double spaces caused by regex
    content = re.sub(r' +', ' ', content).replace(' "', '"')
    content = content.replace('className=""', '')

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
