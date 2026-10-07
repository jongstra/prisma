import { describe, it, expect } from 'vitest';
import { ancestorCounts, heatmapValue } from '../heatmap';

const DOMAIN = 'enterprise-attack';
const l3 = (id: string, parentIds: string[], visibility: number, implementation: number, effectiveness: number) =>
  ({ domain: DOMAIN, level: 3, id, parentIds, visibility, implementation, effectiveness });
const all = { visibility: true, implementation: true, effectiveness: true };
const none = { visibility: false, implementation: false, effectiveness: false };

describe('heatmapValue', () => {
  const useCases = [l3('A', [], 50, 80, 100), l3('B', [], 100, 40, 50)];

  it('averages the product of the selected metrics over the use cases', () => {
    expect(heatmapValue(useCases, all)).toBeCloseTo((40 + 20) / 2); // The average weight.
    expect(heatmapValue(useCases, { ...none, visibility: true })).toBeCloseTo(75);
    expect(heatmapValue(useCases, { ...none, implementation: true, effectiveness: true })).toBeCloseTo((80 + 20) / 2);
  });

  it('supports visibility + effectiveness, which was missing (it showed visibility only)', () => {
    expect(heatmapValue(useCases, { ...none, visibility: true, effectiveness: true })).toBeCloseTo((50 + 50) / 2);
  });

  it('returns null without use cases or without a selected metric', () => {
    expect(heatmapValue([], all)).toBeNull();
    expect(heatmapValue(useCases, none)).toBeNull();
  });
});

describe('ancestorCounts', () => {
  it('counts distinct L2 and L1 use cases above the L3 use cases', () => {
    const allUseCases = [
      { domain: DOMAIN, level: 1, id: 'DOS' }, { domain: DOMAIN, level: 1, id: 'FIN' },
      { domain: DOMAIN, level: 2, id: 'DOS-1', parentIds: ['DOS'] }, { domain: DOMAIN, level: 2, id: 'DOS-2', parentIds: ['DOS', 'FIN'] },
      l3('A', ['DOS-1'], 0, 0, 0), l3('B', ['DOS-1', 'DOS-2'], 0, 0, 0), l3('C', ['DOS-2'], 0, 0, 0),
      { domain: 'mobile-attack', level: 2, id: 'DOS-1', parentIds: ['X'] },
    ];
    expect(ancestorCounts(allUseCases.filter((u) => u.level === 3), allUseCases)).toEqual({ l2: 2, l1: 2 });
    expect(ancestorCounts([allUseCases[4]], allUseCases)).toEqual({ l2: 1, l1: 1 });
  });
});
