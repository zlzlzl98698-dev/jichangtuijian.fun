const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.DOMPurify = {
  addHook: () => {},
  sanitize: (s) => s
};

const mermaid = require('mermaid').default;
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose'
});

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(full));
    } else if (file.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

async function run() {
  const files = getFiles('docs');
  let errCount = 0;
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const regex = /```mermaid\s*\r?\n([\s\S]*?)```/g;
    let match;
    let idx = 0;
    while ((match = regex.exec(content)) !== null) {
      idx++;
      const code = match[1].trim();
      try {
        await mermaid.parse(code);
      } catch (err) {
        console.error(`[ERROR] ${f} (diagram #${idx}):`);
        console.error(code);
        console.error('Message:', err.message || err);
        console.error('-------------------------------------------');
        errCount++;
      }
    }
  }
  console.log(`\n>>> Validation finished. Total diagrams failed: ${errCount}`);
}

run().catch(console.error);
