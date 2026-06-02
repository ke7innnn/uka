import sys

with open('src/app/projects/page.tsx', 'r') as f:
    content = f.read()

# Replace \` with `
content = content.replace("\\`", "`")

# Replace \$ with $
content = content.replace("\\$", "$")

with open('src/app/projects/page.tsx', 'w') as f:
    f.write(content)
