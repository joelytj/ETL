rsync -r src/ docs/
rsync build/contracts/* docs/
git add .
git commit -m "Compiles assets for crowdsale for GitHub Pages"
git push -u origin main