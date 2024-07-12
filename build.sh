bun build --compile --target=bun-linux ./index.ts --outfile ./bin/linux # Current arch/os
bun build --compile --target=bun-linux-arm64 ./index.ts --outfile ./bin/linux-arm64 # Specific arch/os
bun build --compile --target=bun-linux-x64-v1.1.4 ./index.ts --outfile ./bin/linux-x64-v1.1.4
bun build --compile --target=bun-linux-arm64-v1.1.4 ./index.ts --outfile ./bin/linux-arm64-v1.1.4
bun build --compile --target=bun-mac-arm64-v1.1.4 ./index.ts --outfile ./bin/mac-arm64-v1.1.4
bun build --compile --target=bun-mac-x64-v1.1.4 ./index.ts --outfile ./bin/mac-x64-v1.1.4
bun build --compile --target=bun-arm64-mac-v1.1.4 ./index.ts --outfile ./bin/arm64-mac-v1.1.4