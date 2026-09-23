export function focusedInputScrollOffset({
  scrollOffset,
  viewportTop,
  viewportHeight,
  keyboardTop,
  inputTop,
  inputHeight,
}: {
  scrollOffset: number;
  viewportTop: number;
  viewportHeight: number;
  keyboardTop: number;
  inputTop: number;
  inputHeight: number;
}): number | undefined {
  const bottom = Math.min(viewportTop + viewportHeight, keyboardTop) - 16;
  const visibleHeight = Math.min(inputHeight, Math.max(0, bottom - viewportTop - 16));
  const overflow = inputTop + visibleHeight - bottom;
  if (overflow > 0 || inputTop < viewportTop + 16) {
    const delta = overflow > 0 ? overflow : inputTop - viewportTop - 16;
    return Math.max(0, scrollOffset + delta);
  }
  return undefined;
}
