import { describe, it, expect } from 'vitest';
import { barWidth } from '../barWidth';

describe('barWidth', () => {
  it('scales a value relative to the maximum, leaving room for the label', () => {
    expect(barWidth(50, 200)).toBe('calc((100% - 40px) * 0.25)');
    expect(barWidth(200, 200)).toBe('calc((100% - 40px) * 1)');
  });

  it('never exceeds the container, whatever the data', () => {
    expect(barWidth(538, 100)).toBe('calc((100% - 40px) * 1)');
    expect(barWidth(-5, 100)).toBe('calc((100% - 40px) * 0)');
  });

  it('handles empty charts and missing values', () => {
    expect(barWidth(0, 0)).toBe('calc((100% - 40px) * 0)');
    expect(barWidth(NaN, 100)).toBe('calc((100% - 40px) * 0)');
  });

  it('accepts a custom label space', () => {
    expect(barWidth(30, 100, '0px')).toBe('calc((100% - 0px) * 0.3)');
  });
});
