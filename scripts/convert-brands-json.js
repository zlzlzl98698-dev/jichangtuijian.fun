import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tsFile = path.resolve(__dirname, "../docs/.vitepress/data/brands.ts");
const content = fs.readFileSync(tsFile, "utf-8");

// Extract the AIRPORT_BRANDS array
const startIdx = content.indexOf("export const AIRPORT_BRANDS: AirportBrand[] = [");
const jsonStart = content.indexOf("[", startIdx);
const jsonEnd = content.lastIndexOf("];");
const arrayStr = content.slice(jsonStart, jsonEnd + 1);

// We can evaluate or parse it safely
const brands = eval(arrayStr);
const jsonPath = path.resolve(__dirname, "../docs/.vitepress/data/brands.json");
fs.writeFileSync(jsonPath, JSON.stringify(brands, null, 2), "utf-8");
console.log(`Generated brands.json with ${brands.length} brands!`);
