import fs from "fs";
import path from "path";

function getAllMdFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getAllMdFiles(fullPath));
    } else if (item.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getAllMdFiles("docs");
let totalFixed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf-8");
  if (!content.includes("```mermaid")) continue;

  const newContent = content.replace(/```mermaid([\s\S]*?)```/g, (match, code) => {
    let lines = code.split("\n");
    let newLines = lines.map((line) => {
      let l = line;

      // 1. Fix raw \n in node strings
      l = l.replace(/\\n/g, "<br/>");

      // 2. Fix unquoted subgraph syntax: `subgraph 手机底层硬件层` -> `subgraph sub1 ["手机底层硬件层"]`
      const subgraphMatch = l.match(/^(\s*)subgraph\s+([^\s\[]+)(\s*)$/);
      if (subgraphMatch) {
        const indent = subgraphMatch[1];
        const name = subgraphMatch[2].trim();
        const id = "sub_" + Math.random().toString(36).substring(2, 7);
        return `${indent}subgraph ${id} ["${name}"]`;
      }

      // 3. Fix unquoted/raw edge syntax: `-- label with spaces or / -->` -> `-->|"label"|`
      // Matches: `A -- some text / with slashes --> B`
      const edgeMatch = l.match(/^(\s*\S+)\s+--\s+(.*?)\s+-->\s*(\S+.*)$/);
      if (edgeMatch) {
        const source = edgeMatch[1];
        const label = edgeMatch[2].replace(/"/g, "'");
        const target = edgeMatch[3];
        return `${source} -->|"${label}"| ${target}`;
      }

      // Matches: `A -->|label with no quotes| B` -> ensure quotes around label
      const pipeMatch = l.match(/^(\s*\S+)\s*-->\|(.*?)\|\s*(\S+.*)$/);
      if (pipeMatch) {
        const source = pipeMatch[1];
        let label = pipeMatch[2].trim();
        if (!label.startsWith('"')) {
          label = `"${label.replace(/"/g, "'")}"`;
        }
        const target = pipeMatch[3];
        return `${source} -->|${label}| ${target}`;
      }

      return l;
    });

    totalFixed++;
    return "```mermaid" + newLines.join("\n") + "```";
  });

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, "utf-8");
    console.log(`Fixed mermaid syntax in: ${file}`);
  }
}

console.log(`Mermaid sanitization completed! Examined ${files.length} files.`);
