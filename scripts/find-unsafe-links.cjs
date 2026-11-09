const fs = require('fs');
const path = require('path');
function getHtmlFiles(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) res = res.concat(getHtmlFiles(full));
    else if (f.endsWith('.html')) res.push(full);
  }
  return res;
}
for (const file of getHtmlFiles('docs/.vitepress/dist')) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = file.replace(/\\/g, '/').replace('docs/.vitepress/dist/', '');
  const linkMatches = [...content.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)];
  for (const lm of linkMatches) {
    const href = lm[1];
    const fullTag = lm[0];
    if (href.includes('aff') || href.includes('code=')) {
      const hasNofollow = /rel=["'][^"']*nofollow[^"']*["']/i.test(fullTag);
      const hasSponsored = /rel=["'][^"']*sponsored[^"']*["']/i.test(fullTag);
      if (!hasNofollow || !hasSponsored) {
        console.log(relPath, '-->', fullTag);
      }
    }
  }
}
