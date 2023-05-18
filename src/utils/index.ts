import minimatch from 'minimatch';

export function getDefaultExtensions() {
  return Object.keys(require.extensions);
}

export function isMatch(filename: string, patterns: string | string[], matchBase = false) {
  if (!Array.isArray(patterns)) {
    patterns = [patterns];
  }
  return patterns.some(pattern => minimatch(filename, pattern, { matchBase }));
}
