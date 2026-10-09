import { describe, it, expect } from 'vitest';
import { tooltipPlacement } from '../tooltipPlacement';

const window = { width: 1400, height: 900 };
const button = (left: number, top: number) => ({ left, top, width: 141, height: 30 });
const tooltip = (height: number) => ({ width: 300, height });

describe('tooltipPlacement', () => {
  it('puts the tooltip just below the button and a little to the right, with the room below as its maximum height', () => {
    expect(tooltipPlacement(button(100, 200), tooltip(400), window)).toEqual({ left: 116, top: 236, maxHeight: 656 });
  });

  it('puts the tooltip above the button when there is more room above, whatever its length', () => {
    expect(tooltipPlacement(button(100, 700), tooltip(400), window)).toEqual({ left: 116, top: 294, maxHeight: 686 });
    // A short tooltip goes above as well, even though it would fit below: neighbouring buttons get the same direction.
    expect(tooltipPlacement(button(100, 600), tooltip(100), window)).toEqual({ left: 116, top: 494, maxHeight: 586 });
    // Too tall for the room above as well: it fills that room, and the rest scrolls inside the tooltip.
    expect(tooltipPlacement(button(100, 700), tooltip(2000), window)).toEqual({ left: 116, top: 8, maxHeight: 686 });
  });

  it('keeps a tall tooltip below the button when there is more room below', () => {
    expect(tooltipPlacement(button(100, 200), tooltip(2000), window)).toEqual({ left: 116, top: 236, maxHeight: 656 });
  });

  it('keeps the tooltip inside the window horizontally', () => {
    expect(tooltipPlacement(button(1300, 200), tooltip(400), window).left).toBe(1092);
    expect(tooltipPlacement(button(-50, 200), tooltip(400), window).left).toBe(8);
  });

  it('gives the tooltip some height, even in a very small window', () => {
    expect(tooltipPlacement(button(100, 40), tooltip(400), { width: 1400, height: 150 }).maxHeight).toBe(100);
  });
});
