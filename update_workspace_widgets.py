import re
import glob
import os

files = glob.glob("src/components/v2/workspace/*.tsx")

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()

    if "SpotlightCard" not in content and "export const" in content:
        # Add import
        import_stmt = 'import { SpotlightCard } from "@/components/v2/SpotlightCard"\n'
        content = import_stmt + content
        
        # Replace outer div
        # Most of them are like <div className="rounded-2xl bg-surface-2 p-6...
        # Let's just do a manual replace of the first such div in the return statement.
        pattern = r'(return \(\s*)<div (className="(?:rounded-2xl|relative).*?bg-surface-2[^"]*")>'
        
        def repl(m):
            return m.group(1) + "<SpotlightCard " + m.group(2) + ">"
        
        new_content = re.sub(pattern, repl, content, count=1, flags=re.DOTALL)
        
        if new_content != content:
            content = new_content
            # Replace the last </div> before the end of the file/component
            # It's usually `    </div>\n  )\n}` or similar
            content = re.sub(r'</div>(\s*\)\s*})$', r'</SpotlightCard>\g<1>', content)
            
            with open(file_path, "w") as f:
                f.write(content)
            print(f"Updated {file_path}")

