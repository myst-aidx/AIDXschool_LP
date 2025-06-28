import re

# Read the file
with open('ai-biz-freemium-lp-v7.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all demo-stage sections with 3 scenes
pattern = r'<div class="demo-stage" id="demoStage">.*?</div>\s*</div>\s*</div>\s*</div>'
matches = list(re.finditer(pattern, content, re.DOTALL))

print(f"Found {len(matches)} demo stage sections")

# Keep only the first stage, remove the rest
if len(matches) > 1:
    # Work backwards to avoid offset issues
    for match in reversed(matches[1:]):
        start, end = match.span()
        content = content[:start] + content[end:]
        print(f"Removed stage at position {start}-{end}")

# Write the updated content
with open('ai-biz-freemium-lp-v7.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("File updated successfully")
