npm run build

## add the shebang to build output
echo '#!/usr/bin/env node' | cat - bin/index.js > temp && mv temp bin/index.js
