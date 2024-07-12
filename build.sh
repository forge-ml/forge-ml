npm run build

## Insert node shebang for forge-ml
echo "#!/usr/bin/env node" | cat - forge-ml > forge-ml.js
chmod +x forge-ml.js