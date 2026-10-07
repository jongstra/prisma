import { describe, it, expect } from 'vitest';
import { recalculateUseCases, type MagmaUseCase } from '../calculations';

const DOMAIN = 'enterprise-attack';

/** The two permanent L1 use cases that every domain has. */
const cumulative = (domain = DOMAIN): MagmaUseCase[] => [
  { domain, level: 1, id: 'IN', uid: 'IN', permanent: true },
  { domain, level: 1, id: 'THR', uid: 'THR', permanent: true },
];

const l3 = (id: string, parentIds: string[], visibility: unknown, implementation: unknown, effectiveness: unknown, domain = DOMAIN): MagmaUseCase =>
  ({ domain, level: 3, id, uid: id, parentIds, visibility, implementation, effectiveness } as MagmaUseCase);
const l2 = (id: string, parentIds: string[], domain = DOMAIN): MagmaUseCase => ({ domain, level: 2, id, uid: id, parentIds });
const business = (id: string, inImpact: number, thrImpact: number, outImpact: number, domain = DOMAIN): MagmaUseCase =>
  ({ domain, level: 1, id, uid: id, inImpact, thrImpact, outImpact });

const find = (useCases: MagmaUseCase[], id: string, domain = DOMAIN) => useCases.find((u) => u.id === id && u.domain === domain)!;

describe('L3 detection rules', () => {
  it('weight = visibility × implementation × effectiveness, potential = 100 − weight', () => {
    const useCases = [l3('A', [], 50, 80, 50)];
    recalculateUseCases(useCases);
    expect(useCases[0].weight).toBeCloseTo(20);
    expect(useCases[0].potential).toBeCloseTo(80);
  });

  it('accepts values typed in as text and treats missing values as 0', () => {
    const useCases = [l3('A', [], '75', '75', '75'), l3('B', [], null, 100, 100)];
    recalculateUseCases(useCases);
    expect(useCases[0].weight).toBeCloseTo(42.1875); // The documentation's example: 75% × 75% × 75% ≈ 42%.
    expect(useCases[1].weight).toBe(0);
    expect(useCases[1].potential).toBe(100);
  });
});

describe('L2 and L1 averages', () => {
  it('averages the child use cases, including their weights', () => {
    const useCases = [business('BIZ', 0, 0, 100), l2('BIZ-1', ['BIZ']), l3('A', ['BIZ-1'], 100, 40, 50), l3('B', ['BIZ-1'], 60, 100, 100)];
    recalculateUseCases(useCases);
    const parent = find(useCases, 'BIZ-1');
    expect(parent.visibility).toBeCloseTo(80);
    expect(parent.implementation).toBeCloseTo(70);
    expect(parent.effectiveness).toBeCloseTo(75);
    expect(parent.weight).toBeCloseTo((20 + 60) / 2); // The average of the weights, not the product of the averages.
    expect(parent.potential).toBeCloseTo(60);
    expect(find(useCases, 'BIZ').weight).toBeCloseTo(40);
  });

  it('gives use cases without children zeros and a potential of 100', () => {
    const useCases = [l2('EMPTY', [])];
    recalculateUseCases(useCases);
    expect(useCases[0]).toMatchObject({ visibility: 0, implementation: 0, effectiveness: 0, weight: 0, potential: 100 });
  });

  it('counts an L3 with two parents in both', () => {
    const useCases = [l2('X', []), l2('Y', []), l3('A', ['X', 'Y'], 100, 100, 50)];
    recalculateUseCases(useCases);
    expect(find(useCases, 'X').weight).toBeCloseTo(50);
    expect(find(useCases, 'Y').weight).toBeCloseTo(50);
  });
});

describe('risk (documentation section 3.1.2)', () => {
  // Builds cumulative IN and THROUGH with the given weights, and a business risk whose own detection has the given weight.
  const scenario = (inWeight: number, thrWeight: number, ownWeight: number, impacts: [number, number, number]) => [
    ...cumulative(),
    l2('IN-1', ['IN']), l3('IN-1-1', ['IN-1'], 100, 100, inWeight),
    l2('THR-1', ['THR']), l3('THR-1-1', ['THR-1'], 100, 100, thrWeight),
    business('RISK', ...impacts), l2('RISK-1', ['RISK']), l3('RISK-1-1', ['RISK-1'], 100, 100, ownWeight),
  ];

  it('DDoS example: cumulative IN 40%, THROUGH 35%, own 85%, impacts 5/0/95 → risk 17%', () => {
    const useCases = scenario(40, 35, 85, [5, 0, 95]);
    recalculateUseCases(useCases);
    expect(find(useCases, 'RISK').risk).toBeCloseTo(17.25); // 100 − (40×5% + 35×0% + 85×95%)
  });

  it('ransomware example: same cumulative scores, own 65%, impacts 25/45/30 → risk 55%', () => {
    const useCases = scenario(40, 35, 65, [25, 45, 30]);
    recalculateUseCases(useCases);
    expect(find(useCases, 'RISK').risk).toBeCloseTo(54.75); // 100 − (40×25% + 35×45% + 65×30%)
  });

  it('updates every business risk when something under cumulative IN changes', () => {
    const useCases = [
      ...cumulative(), l2('IN-1', ['IN']), l3('IN-1-1', ['IN-1'], 100, 100, 0),
      business('A', 100, 0, 0), business('B', 50, 0, 50),
    ];
    recalculateUseCases(useCases);
    expect(find(useCases, 'A').risk).toBeCloseTo(100);
    find(useCases, 'IN-1-1').effectiveness = 80;
    recalculateUseCases(useCases);
    expect(find(useCases, 'IN').weight).toBeCloseTo(80);
    expect(find(useCases, 'A').risk).toBeCloseTo(20);
    expect(find(useCases, 'B').risk).toBeCloseTo(60);
  });
});

describe('robustness', () => {
  it('keeps domains apart, also when they use the same IDs', () => {
    const domainUseCases = (domain: string, implementation: number) => [
      ...cumulative(domain), business('D', 0, 0, 100, domain), l2('D-1', ['D'], domain), l3('D-1-1', ['D-1'], 50, implementation, 50, domain),
    ];
    const useCases = [...domainUseCases('enterprise-attack', 100), ...domainUseCases('mobile-attack', 50)];
    recalculateUseCases(useCases);
    expect(find(useCases, 'D-1', 'enterprise-attack').weight).toBeCloseTo(25);
    expect(find(useCases, 'D-1', 'mobile-attack').weight).toBeCloseTo(12.5);
  });

  it('gives the same result whatever the order of the use cases', () => {
    const build = () => [
      ...cumulative(), business('BIZ', 30, 30, 40), l2('BIZ-1', ['BIZ']), l2('IN-1', ['IN']), l2('THR-1', ['THR']),
      l3('A', ['BIZ-1'], 80, 60, 40), l3('B', ['IN-1'], 50, 50, 50), l3('C', ['THR-1', 'BIZ-1'], 90, 70, 30),
    ];
    const expected = build();
    recalculateUseCases(expected);
    for (let seed = 1; seed <= 25; seed++) {
      const shuffled = shuffle(build(), seed);
      recalculateUseCases(shuffled);
      for (const useCase of expected) {
        expect(find(shuffled, useCase.id)).toEqual(useCase);
      }
    }
  });

  it('stops on a use case that is its own (indirect) parent instead of recursing forever', () => {
    const useCases = [l2('X', ['X']), l2('P', ['Q']), l2('Q', ['P']), l3('A', ['X', 'P'], 100, 100, 100)];
    expect(() => recalculateUseCases(useCases)).not.toThrow();
  });

  it('recalculates 20 L1, 100 L2 and 1,000 L3 use cases quickly', () => {
    const useCases = randomHierarchy(42, 20, 100, 1000);
    const start = performance.now();
    recalculateUseCases(useCases);
    expect(performance.now() - start).toBeLessThan(100);
  });
});

describe('after random edits, every value equals an independent calculation from scratch', () => {
  for (const seed of [1, 2, 3, 4, 5]) {
    it(`seed ${seed}`, () => {
      const random = rng(seed);
      const useCases = randomHierarchy(seed, 4, 12, 40);
      recalculateUseCases(useCases);
      for (let edit = 0; edit < 200; edit++) {
        const l3s = useCases.filter((u) => u.level === 3);
        const parents = useCases.filter((u) => u.level === 2);
        const target = l3s[Math.floor(random() * l3s.length)];
        const action = random();
        if (action < 0.5) {
          target[(['visibility', 'implementation', 'effectiveness'] as const)[Math.floor(random() * 3)]] = Math.round(random() * 100);
        } else if (action < 0.7) {
          target.parentIds = [parents[Math.floor(random() * parents.length)].id];
        } else if (action < 0.8) {
          const l1 = useCases.filter((u) => u.level === 1 && !u.permanent);
          l1[Math.floor(random() * l1.length)].inImpact = Math.round(random() * 100);
        } else if (action < 0.9) {
          useCases.splice(useCases.indexOf(target), 1);
        } else {
          useCases.push(l3(`NEW-${edit}`, [parents[Math.floor(random() * parents.length)].id], 50, 50, 50, target.domain));
        }
        recalculateUseCases(useCases);
      }
      const reference = referenceCalculation(useCases);
      for (const useCase of useCases) {
        const expected = reference.get(useCase)!;
        for (const field of ['visibility', 'implementation', 'effectiveness', 'weight', 'potential', 'risk'] as const) {
          if (expected[field] !== undefined) {
            expect(Number(useCase[field]), `${useCase.domain} ${useCase.id} ${field}`).toBeCloseTo(expected[field]!, 9);
          }
        }
      }
    });
  }
});

// --- helpers ---------------------------------------------------------------------------------------------------------

function rng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function shuffle<T>(items: T[], seed: number): T[] {
  const random = rng(seed);
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** A random but valid hierarchy over two domains, with some L3 use cases that have two parents. */
function randomHierarchy(seed: number, l1Count: number, l2Count: number, l3Count: number): MagmaUseCase[] {
  const random = rng(seed);
  const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)];
  const useCases: MagmaUseCase[] = [];
  for (const domain of ['enterprise-attack', 'mobile-attack']) {
    useCases.push(...cumulative(domain));
    const l1Ids = ['IN', 'THR'];
    for (let i = 0; i < l1Count; i++) {
      const inImpact = Math.round(random() * 50);
      const thrImpact = Math.round(random() * (100 - inImpact));
      useCases.push(business(`L1-${i}`, inImpact, thrImpact, 100 - inImpact - thrImpact, domain));
      l1Ids.push(`L1-${i}`);
    }
    const l2Ids: string[] = [];
    for (let i = 0; i < l2Count; i++) {
      useCases.push(l2(`L2-${i}`, [pick(l1Ids)], domain));
      l2Ids.push(`L2-${i}`);
    }
    for (let i = 0; i < l3Count; i++) {
      const parentIds = random() < 0.2 ? [pick(l2Ids), pick(l2Ids)] : [pick(l2Ids)];
      useCases.push(l3(`L3-${i}`, [...new Set(parentIds)], Math.round(random() * 100), Math.round(random() * 100), Math.round(random() * 100), domain));
    }
  }
  return useCases;
}

/**
 * An independent, deliberately simple calculation of the expected values: repeat "every L1/L2 is the average of its
 * children" until nothing changes (no ordering needed), then calculate the risks. Works on copies.
 */
function referenceCalculation(useCases: MagmaUseCase[]) {
  type Values = { visibility: number; implementation: number; effectiveness: number; weight: number; potential?: number; risk?: number };
  const values = new Map<MagmaUseCase, Values>();
  for (const u of useCases) {
    const weight = u.level === 3 ? (Number(u.visibility) / 100) * (Number(u.implementation) / 100) * (Number(u.effectiveness) / 100) * 100 : 0;
    values.set(u, { visibility: Number(u.visibility) || 0, implementation: Number(u.implementation) || 0, effectiveness: Number(u.effectiveness) || 0, weight });
  }
  for (let round = 0; round < 10; round++) {
    for (const u of useCases) {
      if (u.level === 3) continue;
      const children = useCases.filter((c) => c.domain === u.domain && Array.isArray(c.parentIds) && (c.parentIds as string[]).includes(u.id));
      const avg = (f: keyof Values) => (children.length ? children.reduce((s, c) => s + (values.get(c)![f] ?? 0), 0) / children.length : 0);
      values.set(u, { visibility: avg('visibility'), implementation: avg('implementation'), effectiveness: avg('effectiveness'), weight: avg('weight') });
    }
  }
  for (const u of useCases) {
    const v = values.get(u)!;
    v.potential = 100 - v.weight;
    if (u.level === 1 && !u.permanent) {
      const weightOf = (uid: string) => values.get(useCases.find((c) => c.domain === u.domain && c.uid === uid)!)!.weight;
      const risk = 1 - ((Number(u.inImpact) / 100) * (weightOf('IN') / 100) + (Number(u.thrImpact) / 100) * (weightOf('THR') / 100) + (Number(u.outImpact) / 100) * (v.weight / 100));
      v.risk = Math.max(0, risk) * 100;
    }
  }
  return values;
}
