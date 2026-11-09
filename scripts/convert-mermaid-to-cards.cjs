const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(getFiles(full));
    } else if (file.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .trim();
}

function convertMermaidBlock(block) {
  const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const nodes = [];
  const nodeMap = new Map();
  for (const line of lines) {
    if (/^(```|flowchart|graph|subgraph|end)/i.test(line)) continue;
    // Match node definitions: A[text], A["text"], A{text}, A{"text"}, A([text]), A(["text"])
    const matches = [...line.matchAll(/([a-zA-Z0-9_-]+)(?:\[|{|\(\[)"?([^"\]\}\)]+)"?(?:\]|}|\)\])/g)];
    for (const m of matches) {
      const id = m[1];
      const rawText = m[2];
      if (!nodeMap.has(id)) {
        let parts = rawText.split(/<br\s*\/?>/i).map(p => p.trim()).filter(Boolean);
        let title = parts[0] || '';
        let desc = parts.slice(1).join(' ') || title;
        if (parts.length === 1) {
          desc = title;
        }
        nodeMap.set(id, { id, title: cleanText(title), desc: cleanText(desc) });
        nodes.push(nodeMap.get(id));
      }
    }
  }

  if (nodes.length > 0) {
    if (nodes.length <= 5) {
      let html = `<div class="decision-flow-container" style="margin: 1.5rem 0;">\n`;
      nodes.forEach((n, idx) => {
        const num = String(idx + 1).padStart(2, '0');
        html += `  <div class="decision-flow-step">\n    <div class="step-num">${num}</div>\n    <div class="step-content">\n      <div class="step-title">${n.title}</div>\n      <div class="step-desc">${n.desc}</div>\n    </div>\n  </div>\n`;
      });
      html += `</div>`;
      return html;
    } else {
      let html = `<div class="scenario-flow-container" style="margin: 1.5rem 0;">\n`;
      nodes.forEach((n, idx) => {
        const num = String(idx + 1).padStart(2, '0');
        html += `  <div class="scenario-flow-card">\n    <div class="scenario-step-badge">阶段 ${num}</div>\n    <div class="scenario-step-title">${n.title}</div>\n    <div class="scenario-step-desc">${n.desc}</div>\n  </div>\n`;
      });
      html += `</div>`;
      return html;
    }
  }

  return null;
}

function processAll() {
  const files = getFiles('docs');
  let replacedCount = 0;
  for (const f of files) {
    let content = fs.readFileSync(f, 'utf8');
    if (!content.includes('```mermaid')) continue;
    
    let modified = false;
    content = content.replace(/```mermaid\s*\r?\n([\s\S]*?)```/g, (match) => {
      const converted = convertMermaidBlock(match);
      if (converted) {
        modified = true;
        replacedCount++;
        return converted;
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(f, content, 'utf8');
      console.log(`Converted remaining mermaid in: ${f}`);
    }
  }
  console.log(`\n🎉 Final converted mermaid diagrams: ${replacedCount}`);
}

processAll();
