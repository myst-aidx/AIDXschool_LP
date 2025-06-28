import re

# Read the file
with open('ai-biz-freemium-lp-v7.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all demo modal sections
pattern = r'<\!-- 30秒体験デモモーダル -->.*?</div>\s*\n\s*</div>\s*\n'
matches = list(re.finditer(pattern, content, re.DOTALL))

print(f"Found {len(matches)} demo modal sections")

# Keep only the first modal, remove the rest
if len(matches) > 1:
    # Work backwards to avoid offset issues
    for match in reversed(matches[1:]):
        start, end = match.span()
        content = content[:start] + content[end:]
        print(f"Removed modal at position {start}-{end}")

# Write the updated content
with open('ai-biz-freemium-lp-v7.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("File updated successfully")
