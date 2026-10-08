import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { parse } from 'yaml';
import {
  averageVisibilityPercentage,
  isDetectable,
  ownVisibility,
  platformVisibility,
  techniqueVisibility,
  type Completeness,
  type TechniqueLike,
} from '../visibility';

const technique = (data_components: string[], sub_techniques?: TechniqueLike[]): TechniqueLike => ({ data_components, sub_techniques });

describe('ownVisibility', () => {
  it('averages the device completeness over the unique data components', () => {
    const completeness: Completeness = new Map([['A', 1], ['B', 0.4]]);
    expect(ownVisibility(technique(['A', 'B', 'C']), completeness)).toBeCloseTo(1.4 / 3);
    expect(ownVisibility(technique(['A', 'A', 'B']), completeness)).toBeCloseTo(0.7);
  });

  it('returns null when ATT&CK lists no data components', () => {
    expect(ownVisibility(technique([]), new Map())).toBeNull();
  });
});

describe('techniqueVisibility', () => {
  const completeness: Completeness = new Map([['A', 1]]);

  it('leaves sub-techniques without data components out of the average', () => {
    const parent = technique(['A'], [technique(['A']), technique([]), technique([])]);
    expect(techniqueVisibility(parent, completeness)).toBe(1);
  });

  it('uses the sub-techniques when the parent itself has no data components', () => {
    const parent = technique([], [technique(['A']), technique(['B'])]);
    expect(techniqueVisibility(parent, completeness)).toBe(0.5);
    expect(isDetectable(parent)).toBe(true);
  });

  it('returns null for techniques that cannot be detected via data sources', () => {
    const parent = technique([], [technique([])]);
    expect(techniqueVisibility(parent, completeness)).toBeNull();
    expect(isDetectable(parent)).toBe(false);
  });
});

describe('averageVisibilityPercentage', () => {
  it('only counts techniques that can be detected via data sources', () => {
    const techniques = [
      { ...technique(['A']), visibility_ratio: 1 },
      { ...technique(['B']), visibility_ratio: 0.5 },
      { ...technique([]), visibility_ratio: 0 },
    ];
    expect(averageVisibilityPercentage(techniques)).toBe(75);
    expect(averageVisibilityPercentage([technique([])])).toBeNull();
  });
});

describe('with the real ATT&CK catalog and the maximum-quality DeTT&CT example', () => {
  const catalog = JSON.parse(fs.readFileSync('public/tactics_and_techniques_by_domain.json', 'utf8')).enterprise;
  const dettect = parse(fs.readFileSync('../examples/dettect/enterprise_max_quality.yaml', 'utf8'));
  const completeness: Completeness = new Map(
    dettect.data_sources.map((ds: any) => [ds.data_source_name, ds.data_source[0].data_quality.device_completeness / 5]),
  );

  it('gives every detectable technique exactly 100%, never more (rounding errors hid some techniques)', () => {
    for (const tactic of catalog.tactics) {
      for (const t of tactic.techniques) {
        if (isDetectable(t)) {
          expect(techniqueVisibility(t, completeness), `${t.external_id} in ${tactic.name}`).toBe(1);
        }
      }
    }
  });

  it('gives every tactic 100%, including Reconnaissance and Resource Development', () => {
    for (const tactic of catalog.tactics) {
      const techniques = tactic.techniques.map((t: TechniqueLike) => ({ ...t, visibility_ratio: techniqueVisibility(t, completeness) ?? 0 }));
      expect(averageVisibilityPercentage(techniques), tactic.name).toBe(100);
    }
  });

  it('marks the techniques for which ATT&CK lists no data components as not detectable', () => {
    const notDetectable = new Set<string>();
    for (const tactic of catalog.tactics) {
      for (const t of tactic.techniques) {
        if (!isDetectable(t)) notDetectable.add(t.external_id);
      }
    }
    expect([...notDetectable].sort()).toEqual(['T1590', 'T1591', 'T1593', 'T1596', 'T1597', 'T1650']);
  });
});

describe('platformVisibility', () => {
  const technique = (id: string, visibility: number, platforms = ['Windows']) =>
    ({ external_id: id, platforms, data_components: ['Process Creation'], visibility_ratio: visibility });

  it('counts a technique that belongs to several tactics once', () => {
    const shared = technique('T1', 0.2);
    const tactics = [{ techniques: [shared] }, { techniques: [shared, technique('T2', 0.8)] }];
    expect(platformVisibility(tactics).get('Windows')).toBeCloseTo(50); // (20% + 80%) / 2, not (20% + 20% + 80%) / 3
  });

  it('can count all techniques under one platform, as for ICS', () => {
    const tactics = [{ techniques: [technique('T1', 0.2, []), technique('T2', 0.4, [])] }];
    expect(platformVisibility(tactics, () => ['None']).get('None')).toBeCloseTo(30);
  });
});
