import re

# Read the file
with open('ai-biz-freemium-lp-v7.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all duplicate progress bars and sections that appear outside the modal
# Keep only content that's inside the proper modal structure
lines = content.split('\n')
cleaned_lines = []
skip_until_section = False
modal_nesting = 0

for line in lines:
    # Track modal nesting
    if '<div class="demo-modal"' in line:
        modal_nesting += 1
    elif '</div>' in line and modal_nesting > 0:
        # Check if this closes the modal
        if 'demo-modal' in line or (modal_nesting == 1 and 'demo-particles' in cleaned_lines[-5:] if len(cleaned_lines) >= 5 else False):
            modal_nesting -= 1
    
    # Skip duplicate demo-progress-bar outside of modal
    if '<div class="demo-progress-bar">' in line and modal_nesting == 0:
        skip_until_section = True
        continue
    
    # Skip until we find a proper section start
    if skip_until_section and '<section' in line:
        skip_until_section = False
        cleaned_lines.append(line)
        continue
    elif skip_until_section:
        continue
    
    cleaned_lines.append(line)

# Write the cleaned content
with open('ai-biz-freemium-lp-v7.html', 'w', encoding='utf-8') as f:
    f.write('\n'.join(cleaned_lines))

print("Removed remaining duplicates")
