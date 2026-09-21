export const MINIMUM_WRITING_WORDS = 5;

export function countWritingWords(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
}

export function hasEnoughWriting(value: string) {
  return countWritingWords(value) >= MINIMUM_WRITING_WORDS;
}
