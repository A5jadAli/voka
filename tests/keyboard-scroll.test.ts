import { describe, expect, it } from '@jest/globals';
import { focusedInputScrollOffset } from '@/components/keyboard-scroll';
const viewport = {
  scrollOffset: 0,
  viewportTop: 32,
  viewportHeight: 380,
  keyboardTop: 500,
  inputTop: 550,
  inputHeight: 130,
};
describe('focused input above the keyboard and fixed footer', () => {
  it('reserves the actual footer space rather than scrolling just above the keyboard', () => {
    expect(focusedInputScrollOffset(viewport)).toBe(284);
  });
  it('does not move an already visible input', () => {
    expect(focusedInputScrollOffset({ ...viewport, inputTop: 70 })).toBeUndefined();
  });
  it('can reveal an earlier field without a negative scroll offset', () => {
    expect(focusedInputScrollOffset({ ...viewport, scrollOffset: 150, inputTop: 10 })).toBe(112);
    expect(focusedInputScrollOffset({ ...viewport, inputTop: 10 })).toBe(0);
  });
  it('handles a larger font or a viewport shorter than the field', () => {
    expect(focusedInputScrollOffset({ ...viewport, inputHeight: 600 })).toBe(502);
  });
});
