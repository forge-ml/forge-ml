git add .
git commit -m "version change"
git push
sh build.sh
npm version patch
npm publish