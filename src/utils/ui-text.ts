export function normalizeUiText(value: string) {
  return value.replace(/\s*\u2014\s*/g, ', ');
}
