import { describe, it, expect } from 'vitest';
import { findParentCycles, findUnknownParents, percentageProblem } from '../validation';

const DOMAIN = 'enterprise-attack';
const useCase = (id: string, parentIds: unknown = [], domain = DOMAIN) => ({ domain, id, parentIds });

describe('percentageProblem', () => {
  it('accepts empty values and numbers from 0 to 100, also typed as text', () => {
    for (const value of [undefined, null, '', 0, 50, 100, 12.5, '50', ' 75 ']) {
      expect(percentageProblem(value), String(value)).toBeNull();
    }
  });

  it('rejects text, out-of-range numbers and other types', () => {
    for (const value of ['abc', -5, 150, 100.01, NaN, Infinity, true, [50], {}]) {
      expect(percentageProblem(value), String(value)).toBe('it must be a number from 0 to 100');
    }
  });
});

describe('findParentCycles', () => {
  it('finds a use case that is its own parent', () => {
    const self = useCase('X', ['X']);
    expect(findParentCycles([self]).get(self)).toEqual(['X', 'X']);
  });

  it('finds indirect cycles, for every use case in the cycle', () => {
    const a = useCase('A', ['B']);
    const b = useCase('B', ['C']);
    const c = useCase('C', ['A']);
    const cycles = findParentCycles([a, b, c, useCase('D', ['A'])]);
    expect(cycles.get(a)).toEqual(['A', 'B', 'C', 'A']);
    expect(cycles.get(b)).toEqual(['B', 'C', 'A', 'B']);
    expect(cycles.size).toBe(3); // D only points into the cycle; it is not part of it.
  });

  it('does not report normal hierarchies, multiple parents or other domains', () => {
    const useCases = [
      useCase('DOS'), useCase('DOS-1', ['DOS']), useCase('DOS-1-1', ['DOS-1']), useCase('BOTH', ['DOS-1', 'DOS']),
      useCase('X', ['Y'], 'mobile-attack'), useCase('Y', ['X'], 'ics-attack'), useCase('Z', 'not a list'), useCase('N', ['none']),
    ];
    expect(findParentCycles(useCases).size).toBe(0);
  });
});

describe('findUnknownParents', () => {
  it('lists parent IDs that do not exist in the same domain, ignoring "none"', () => {
    const typo = useCase('DOS-1-1', ['DOS-l']);
    const otherDomain = useCase('M-1', ['DOS'], 'mobile-attack');
    const result = findUnknownParents([useCase('DOS'), useCase('DOS-1', ['DOS']), typo, otherDomain, useCase('N', ['none'])]);
    expect(result).toEqual([
      { useCase: typo, parentId: 'DOS-l' },
      { useCase: otherDomain, parentId: 'DOS' },
    ]);
  });
});
