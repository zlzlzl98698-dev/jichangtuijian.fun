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

const htmlFiles = getHtmlFiles('docs/.vitepress/dist');

// 1. Canonical check
let canonicalMissing = [];
let canonicalNotHttps = [];
let canonicalUrls = new Map();

// 2. Affiliate links check
let unsafeAffLinks = [];
let totalAffLinks = 0;

// 3. Title & Meta description check
let titles = new Map();
let descMap = new Map();

// 4. Word count & thin content check
let wordCounts = [];

// 5. JSON-LD check
let jsonLdMissing = [];
let jsonLdErrors = [];
let jsonLdTypes = new Map();

// 6. Dead internal links check
let internalLinks = [];
let allUrlsSet = new Set(htmlFiles.map(f => {
  let rel = f.replace(/\\/g, '/').replace('docs/.vitepress/dist/', '');
  return '/' + rel.replace(/index\.html$/, '').replace(/\.html$/, '');
}));

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = file.replace(/\\/g, '/').replace('docs/.vitepress/dist/', '');

  // Canonical
  const canonMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (!canonMatch) {
    canonicalMissing.push(relPath);
  } else {
    const u = canonMatch[1];
    if (!u.startsWith('https://')) canonicalNotHttps.push({ file: relPath, url: u });
    canonicalUrls.set(relPath, u);
  }

  // Affiliate link check
  const linkMatches = [...content.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)];
  for (const lm of linkMatches) {
    const href = lm[1];
    const fullTag = lm[0];
    if (href.includes('aff') || href.includes('code=') || href.includes('gsyvipaff') || href.includes('twilightaff')) {
      totalAffLinks++;
      const hasNofollow = /rel=["'][^"']*nofollow[^"']*["']/i.test(fullTag);
      const hasSponsored = /rel=["'][^"']*sponsored[^"']*["']/i.test(fullTag);
      const hasNoopener = /rel=["'][^"']*noopener[^"']*["']/i.test(fullTag);
      if (!hasNofollow || !hasSponsored || !hasNoopener) {
        unsafeAffLinks.push({ file: relPath, tag: fullTag, href });
      }
    } else if (href.startsWith('/') && !href.startsWith('/images') && !href.startsWith('/assets') && !href.startsWith('/#')) {
      internalLinks.push({ from: relPath, to: href });
    }
  }

  // Title & Desc
  const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
  if (titleMatch) {
    const t = titleMatch[1].trim();
    if (!titles.has(t)) titles.set(t, []);
    titles.get(t).push(relPath);
  }

  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  if (descMatch) {
    const d = descMatch[1].trim();
    if (!descMap.has(d)) descMap.set(d, []);
    descMap.get(d).push(relPath);
  }

  // Pure text word count
  const bodyText = content.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
  const chineseChars = (bodyText.match(/[\u4e00-\u9fa5]/g) || []).length;
  wordCounts.push({ file: relPath, chineseChars, totalChars: bodyText.length });

  // JSON-LD
  const jsonLdMatch = content.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
  if (!jsonLdMatch) {
    jsonLdMissing.push(relPath);
  } else {
    for (const jm of jsonLdMatch) {
      const jsonStr = jm.replace(/<\/?script[^>]*>/gi, '').trim();
      try {
        const parsed = JSON.parse(jsonStr);
        const t = parsed['@type'] || 'Unknown';
        jsonLdTypes.set(t, (jsonLdTypes.get(t) || 0) + 1);
      } catch (e) {
        jsonLdErrors.push({ file: relPath, error: e.message });
      }
    }
  }
}

// Check internal dead links
let brokenLinks = [];
for (const link of internalLinks) {
  let cleanTo = link.to.split('#')[0].split('?')[0];
  if (!cleanTo) continue;
  if (cleanTo.endsWith('/') && cleanTo.length > 1) cleanTo = cleanTo.slice(0, -1);
  
  // check if matches any URL
  let found = false;
  for (const u of allUrlsSet) {
    let cu = u;
    if (cu.endsWith('/') && cu.length > 1) cu = cu.slice(0, -1);
    if (cu === cleanTo) {
      found = true;
      break;
    }
  }
  if (!found) {
    brokenLinks.push(link);
  }
}

console.log(JSON.stringify({
  totalPages: htmlFiles.length,
  canonicalMissingCount: canonicalMissing.length,
  canonicalMissingSample: canonicalMissing.slice(0, 5),
  canonicalNotHttpsCount: canonicalNotHttps.length,
  totalAffLinks,
  unsafeAffLinksCount: unsafeAffLinks.length,
  unsafeAffLinksSample: unsafeAffLinks.slice(0, 3),
  jsonLdMissingCount: jsonLdMissing.length,
  jsonLdMissingSample: jsonLdMissing.slice(0, 5),
  jsonLdErrorsCount: jsonLdErrors.length,
  jsonLdTypes: Object.fromEntries(jsonLdTypes),
  duplicateTitlesCount: [...titles.entries()].filter(([t, l]) => l.length > 1).length,
  duplicateTitlesSample: [...titles.entries()].filter(([t, l]) => l.length > 1).slice(0, 3),
  duplicateDescCount: [...descMap.entries()].filter(([d, l]) => l.length > 1).length,
  duplicateDescSample: [...descMap.entries()].filter(([d, l]) => l.length > 1).slice(0, 3),
  wordCountsStats: {
    min: Math.min(...wordCounts.map(x => x.chineseChars)),
    max: Math.max(...wordCounts.map(x => x.chineseChars)),
    avg: Math.round(wordCounts.reduce((a, b) => a + b.chineseChars, 0) / wordCounts.length),
    thinPages: wordCounts.filter(x => x.chineseChars < 1000).map(x => ({ file: x.file, count: x.chineseChars }))
  },
  brokenInternalLinksCount: brokenLinks.length,
  brokenInternalLinksSample: brokenLinks.slice(0, 5)
}, null, 2));
