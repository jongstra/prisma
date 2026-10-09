import { describe, it, expect } from 'vitest';
import { parse } from 'yaml';
import { importSummary, magmaFileDomains, readMagmaFile, writeMagmaFile } from '../magmaFile';

describe('magmaFile', () => {
  it('reads a list of use cases, and explains what is wrong with other content', () => {
    expect(readMagmaFile([{ domain: 'mobile-attack', id: 'M-1' }])).toEqual([{ domain: 'mobile-attack', id: 'M-1' }]);
    expect(() => readMagmaFile({ a: 1 })).toThrow('The file does not contain a list of MaGMa use cases.');
    expect(() => readMagmaFile([1, 2])).toThrow('The file does not contain a list of MaGMa use cases.');
    expect(() => readMagmaFile([{ domain: 'unknown', id: 'X' }])).toThrow('The file contains no use cases for a supported domain');
    expect(() => readMagmaFile([{ domain: 'enterprise-attack', id: 'IN', permanent: true }])).toThrow('no use cases for a supported domain');
  });

  it('lists the domains a file has use cases for, in the usual order, without the permanent IN and THR use cases', () => {
    const useCases = [{ domain: 'ics-attack' }, { domain: 'enterprise-attack' }, { domain: 'mobile-attack', permanent: true }];
    expect(magmaFileDomains(useCases)).toEqual(['enterprise-attack', 'ics-attack']);
  });

  it('writes use cases as YAML, leaving out values that are not a number', () => {
    const text = writeMagmaFile([
      { domain: 'enterprise-attack', level: 1, id: 'L1-1', uid: 'x', name: 'n', description: 'd', weight: 0, inImpact: 100, thrImpact: NaN },
    ]);
    expect(text).not.toMatch(/nan/i);
    expect(parse(text)).toEqual([
      { domain: 'enterprise-attack', level: 1, id: 'L1-1', name: 'n', description: 'd', weight: 0, impact: 0, inImpact: 100 },
    ]);
  });

  it('summarises an import: the number of use cases loaded, the ones that failed and why, and the warnings', () => {
    expect(importSummary({ imported: 14, failed: [], warnings: [] })).toEqual({ text: 'Successful imports: 14. Failed imports: 0.', problems: false });
    const line = '_'.repeat(49);
    expect(importSummary({ imported: 1, failed: ['A failed.', 'B failed.'], warnings: ['C is odd.'] })).toEqual({
      text: `Successful imports: 1. Failed imports: 2. ${line} FAILED USE CASES ${line} A failed.• B failed. ${line} WARNINGS ${line} C is odd.`,
      problems: true,
    });
  });
});
