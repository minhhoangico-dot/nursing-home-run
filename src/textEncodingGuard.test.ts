import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const workspaceRoot = path.resolve(__dirname, '..');
const textExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.html', '.css', '.md', '.txt', '.svg', '.sql', '.toml', '.yml', '.yaml']);
const ignoredDirs = new Set(['node_modules', 'dist', '.git', '.worktrees', '.playwright-cli']);
const roots = ['.'];
const likelyMojibakePattern = /(?:[\u00C3\u00C4\u00C6][\u0000-\u024F])|(?:\u00E1[\u00BA\u00BB][\u0000-\u024F]?)|(?:\u00E2[\u20AC\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u2022\u2030\u02C6\u02DC\u0160\u0161\u017D\u017E\u2122])|(?:\u00EF\u00B8[\u0000-\u00FF]?)|\uFFFD/u;
const likelyMojibakePatternGlobal = new RegExp(likelyMojibakePattern.source, 'gu');
const vietnameseCharPattern = /[ĂăÂâĐđÊêÔôƠơƯưÀÁẢÃẠẤẦẨẪẬẮẰẲẴẶÈÉẺẼẸỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌỒỐỔỖỘỜỚỞỠỢÙÚỦŨỤỪỨỬỮỰỲÝỶỸỴàáảãạấầẩẫậắằẳẵặèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/g;
const windows1252ReverseMap = new Map<number, number>([
  [0x20AC, 0x80],
  [0x201A, 0x82],
  [0x0192, 0x83],
  [0x201E, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02C6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8A],
  [0x2039, 0x8B],
  [0x0152, 0x8C],
  [0x017D, 0x8E],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201C, 0x93],
  [0x201D, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02DC, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9A],
  [0x203A, 0x9B],
  [0x0153, 0x9C],
  [0x017E, 0x9E],
  [0x0178, 0x9F],
]);

function collectFiles(target: string, files: string[]) {
  if (!fs.existsSync(target)) return;

  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target)) {
      if (ignoredDirs.has(entry)) continue;
      collectFiles(path.join(target, entry), files);
    }
    return;
  }

  if (!textExtensions.has(path.extname(target))) {
    return;
  }

  files.push(target);
}

function countMatches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

function decodeWindows1252Utf8(value: string) {
  const bytes: number[] = [];

  for (const char of value) {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) continue;

    if (codePoint <= 0xFF) {
      bytes.push(codePoint);
      continue;
    }

    const mappedByte = windows1252ReverseMap.get(codePoint);
    if (mappedByte === undefined) {
      return null;
    }

    bytes.push(mappedByte);
  }

  return Buffer.from(bytes).toString('utf8');
}

function looksLikeMojibake(line: string) {
  if (!likelyMojibakePattern.test(line)) {
    return false;
  }

  const decoded = decodeWindows1252Utf8(line);
  if (!decoded || decoded === line || decoded.includes('\uFFFD')) {
    return false;
  }

  const rawMarkerCount = countMatches(line, likelyMojibakePatternGlobal);
  const decodedMarkerCount = countMatches(decoded, likelyMojibakePatternGlobal);
  const rawVietnameseCount = countMatches(line, vietnameseCharPattern);
  const decodedVietnameseCount = countMatches(decoded, vietnameseCharPattern);

  return decodedMarkerCount < rawMarkerCount || decodedVietnameseCount > rawVietnameseCount;
}

describe('text encoding guard', () => {
  it('keeps source files free of mojibake markers', () => {
    const files: string[] = [];
    roots.forEach((root) => collectFiles(path.join(workspaceRoot, root), files));

    const issues = files.flatMap((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      return content
        .split(/\r?\n/)
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => looksLikeMojibake(line))
        .map(({ line, index }) => `${path.relative(workspaceRoot, filePath)}:${index + 1}: ${line.trim()}`);
    });

    expect(issues).toEqual([]);
  });
});
