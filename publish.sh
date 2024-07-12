git add .
git commit -m "version change"
git push
npm run build
npm version patch
npm publish