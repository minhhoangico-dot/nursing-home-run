/**
 * Generate the next contract number for a given year.
 *
 * Format: 3-digit zero-padded sequence within the year, e.g. "001", "012".
 * The full contract code is rendered as `{number}/2026/DV-VDL` in the template.
 */
export const generateContractNumber = (
  existingNumbers: ReadonlyArray<string | undefined>,
  year: number = new Date().getFullYear(),
): string => {
  const yearStr = String(year);
  let max = 0;
  for (const raw of existingNumbers) {
    if (!raw) continue;
    const match = raw.match(/^(\d+)\/(\d{4})\/DV-VDL$/) ?? raw.match(/^(\d{1,4})$/);
    if (!match) continue;
    if (match.length === 3 && match[2] !== yearStr) continue;
    const n = parseInt(match[1], 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return String(max + 1).padStart(3, '0');
};
