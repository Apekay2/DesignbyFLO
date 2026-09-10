// Tiny JSON-file-backed store for quote requests. Not concurrency-safe, not a
// database — a deliberately minimal stub so requests survive a server restart
// without pulling in real infrastructure for what's still a preview backend.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, 'quotes.json');

function load(){
  if (!existsSync(FILE)) return [];
  try { return JSON.parse(readFileSync(FILE, 'utf8')); }
  catch { return []; }
}
function save(rows){
  mkdirSync(__dirname, { recursive: true });
  writeFileSync(FILE, JSON.stringify(rows, null, 2));
}

export function listQuotes(){
  return load().slice().reverse();
}
export function addQuote(quote){
  const rows = load();
  rows.push(quote);
  save(rows);
  return quote;
}
