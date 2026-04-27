import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('build script', () => {
  it('versions the worker app shell after vite build', () => {
    const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.build).toContain('scripts/version-app-shell.mjs');
  });
});
