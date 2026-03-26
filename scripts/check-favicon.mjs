import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');
const htmlPath = resolve(rootDir, 'index.html');
const html = readFileSync(htmlPath, 'utf8');

const faviconMatch = html.match(/<link[^>]+rel=["']icon["'][^>]+href=["']([^"']+)["']/i);

if (!faviconMatch) {
  console.error('Missing <link rel="icon"> in index.html');
  process.exit(1);
}

const href = faviconMatch[1];
const assetPath = href.startsWith('/')
  ? resolve(rootDir, 'public', href.slice(1))
  : resolve(rootDir, href);

if (!existsSync(assetPath)) {
  console.error(`Favicon asset does not exist: ${assetPath}`);
  process.exit(1);
}

console.log(`Favicon configured: ${href}`);
