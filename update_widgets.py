import re

file_path = "src/components/v2/copilot/Widgets.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Widgets to update:
widgets = [
    "BriefingWidget", "RecommendedOpportunitiesWidget", "DeadlinesWidget", 
    "ResumeInsightsWidget", "ConnectionsWidget", "SkillGapWidget", 
    "InterviewPrepWidget", "CareerProgressWidget", "WeeklyGoalsWidget", 
    "QuickActionsWidget"
]

for w in widgets:
    # Find the start of the return statement for this widget
    pattern = r'(export const ' + w + r' =.*?return \(\s*)<div (className="(?:bg-surface|bg-primary|bg-surface-2)[^"]*")>'
    
    def repl(m):
        return m.group(1) + "<SpotlightCard " + m.group(2) + ">"
    
    new_content = re.sub(pattern, repl, content, flags=re.DOTALL)
    
    if new_content != content:
        content = new_content
        
        # Now we need to find the matching closing div. 
        # Since it's the outermost div of the component, it's followed by \n  )\n}
        close_pattern = r'(</)div>((\s*)\)\s*})'
        # But we only want to replace the one at the end of the widget we just modified.
        # A simpler way is to find the function body and replace its last </div>.
        
        # Let's just find all `</div>\n  )\n}` and replace with `</SpotlightCard>\n  )\n}`
        # This works if every widget was updated.
        pass

content = re.sub(r'</div>(\s*\)\s*})', r'</SpotlightCard>\g<1>', content)

with open(file_path, "w") as f:
    f.write(content)
print("Done Widgets.tsx")
