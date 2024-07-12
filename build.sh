npm run build

filename="forge-ml.js"

## Insert node shebang into built forge-ml.js
sed -i.bak '1i\
#!/usr/bin/env node
' "$filename" && rm "${filename}.bak"

echo "Shebang inserted successfully at the beginning of $filename"
