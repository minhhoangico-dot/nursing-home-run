import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const workerDir = path.join(projectRoot, 'worker');
const indexHtmlPath = path.join(distDir, 'index.html');
const generatedModulePath = path.join(workerDir, 'generatedAppShell.ts');

function resolveShellFileName(indexHtml) {
  const scriptMatch = indexHtml.match(/src="\/assets\/index-([^"]+)\.js"/);
  const assetHash = scriptMatch?.[1] || 'dev';
  return `app-shell-${assetHash}.html`;
}

async function main() {
  const indexHtml = await readFile(indexHtmlPath, 'utf8');
  const shellFileName = resolveShellFileName(indexHtml);
  const shellFilePath = path.join(distDir, shellFileName);

  await writeFile(shellFilePath, indexHtml, 'utf8');
  await mkdir(workerDir, { recursive: true });
  await writeFile(
    generatedModulePath,
    `export const APP_SHELL_PATH = '/${shellFileName}';\n`,
    'utf8',
  );
}

await main();
