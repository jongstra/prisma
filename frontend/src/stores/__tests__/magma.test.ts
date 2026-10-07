import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import fs from 'node:fs';
import { parse, stringify } from 'yaml';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn(() => Promise.resolve({})) } }));

const catalog = JSON.parse(fs.readFileSync('public/tactics_and_techniques_by_domain.json', 'utf8'));
const readExample = (name: string) => fs.readFileSync(`../example_data_dettect/${name}`, 'utf8');

// The magma store creates the tactics store when its module loads, so both are imported after Pinia is active.
async function setUpStores() {
  vi.resetModules();
  setActivePinia(createPinia());
  const tactics = (await import('../tactics')).tacticsStore();
  const copy = structuredClone(catalog);
  tactics.enterprise = copy.enterprise;
  tactics.mobile = copy.mobile;
  tactics.ics = copy.ics;
  const magma = (await import('../magma')).magmaStore();
  magma.initializeDefaultUseCases();
  // The pop-up messages (the import summary), from the same module instance as the store uses.
  const fire = (await import('sweetalert2')).default.fire as unknown as ReturnType<typeof vi.fn>;
  const lastMessage = () => String(fire.mock.calls.at(-1)?.[0]?.text ?? '');
  return { tactics, magma, lastMessage };
}

describe('magma store with the example files', () => {
  let magma: any;

  beforeEach(async () => {
    const stores = await setUpStores();
    stores.tactics.processDettectYaml(parse(readExample('dettect_editor_data_sources_example_enterprise_LARGE.yaml')));
    magma = stores.magma;
    magma.importUseCases(readExample('magma_data_example.yaml'));
    magma.updateAllL3UseCasesBasedOnDettectVisibility();
  });

  const value = (id: string, field: string) => Number(magma.getUseCaseById(id, 'enterprise-attack')[field]).toFixed(2);

  it('gives the known values for the example (same as before the recalculation rework)', () => {
    expect([value('IN', 'weight'), value('THR', 'weight')]).toEqual(['12.17', '0.00']);
    expect([value('DOS', 'visibility'), value('DOS', 'weight'), value('DOS', 'risk')]).toEqual(['0.00', '0.00', '95.98']);
    expect([value('FIN', 'visibility'), value('FIN', 'weight'), value('FIN', 'risk')]).toEqual(['16.67', '11.30', '92.14']);
  });

  it('updates the business risks when an L3 use case under cumulative IN changes', () => {
    magma.updateUseCase(magma.getUseCaseById('IN-1-1', 'enterprise-attack').uid, { effectiveness: 100 }, 'enterprise-attack');
    expect(value('IN', 'weight')).toBe('15.60');
    expect(value('DOS', 'risk')).toBe('94.85');
    expect(value('FIN', 'risk')).toBe('91.01');
  });

  it('updates parents and risks when an L3 use case is removed', () => {
    magma.removeUseCaseByUid(magma.getUseCaseById('IN-1-1', 'enterprise-attack').uid);
    expect(value('IN', 'weight')).toBe('0.00');
    expect(value('DOS', 'risk')).toBe('100.00');
  });

  it('gives a new L1 use case a risk straight away', () => {
    magma.addNewUseCase(1, 'enterprise-attack');
    const created = magma.L1UseCases('enterprise-attack').at(-1);
    expect(Number(created.risk).toFixed(2)).toBe('87.83'); // IN impact 100% × cumulative IN 12.17%.
  });
});

describe('magma store with the same IDs in two domains', () => {
  it('calculates each domain separately', async () => {
    const { magma } = await setUpStores();
    const useCases = (domain: string, implementation: number) => [
      { domain, level: 1, id: 'D', name: 'd', inImpact: 0, thrImpact: 0, outImpact: 100 },
      { domain, level: 2, id: 'D-1', name: 'd1', parentIds: ['D'] },
      { domain, level: 3, id: 'D-1-1', name: 'd11', parentIds: ['D-1'], visibility: 50, implementation, effectiveness: 50, visibilityFromAttackTechniqueOverride: true },
    ];
    magma.importUseCases(stringify([...useCases('enterprise-attack', 100), ...useCases('mobile-attack', 50)]));
    expect(magma.getUseCaseById('D-1', 'enterprise-attack')?.weight).toBeCloseTo(25);
    expect(magma.getUseCaseById('D-1', 'mobile-attack')?.weight).toBeCloseTo(12.5);
    expect(magma.getUseCaseById('D', 'mobile-attack')?.risk).toBeCloseTo(87.5);
  });
});

describe('magma store performance', () => {
  it('imports 20 L1, 100 L2 and 1,000 L3 use cases quickly', async () => {
    const { magma } = await setUpStores();
    const useCases: object[] = [];
    for (let i = 0; i < 20; i++) useCases.push({ domain: 'enterprise-attack', level: 1, id: `B${i}`, name: 'b', inImpact: 34, thrImpact: 33, outImpact: 33 });
    for (let j = 0; j < 100; j++) useCases.push({ domain: 'enterprise-attack', level: 2, id: `B${j % 20}-${j}`, name: 'l2', parentIds: [`B${j % 20}`] });
    for (let k = 0; k < 1000; k++) useCases.push({ domain: 'enterprise-attack', level: 3, id: `L3-${k}`, name: 'l3', parentIds: [`B${k % 20}-${k % 100}`], implementation: 50, effectiveness: 50, visibility: 50, visibilityFromAttackTechniqueOverride: true });
    const start = performance.now();
    magma.importUseCases(stringify(useCases));
    magma.updateAllL3UseCasesBasedOnDettectVisibility();
    expect(magma.useCases.length).toBe(1126);
    expect(performance.now() - start).toBeLessThan(500); // Was about 3.7 seconds.
  });
});

describe('magma store: invalid data is rejected on import, with the reason', () => {
  it('rejects use cases that are their own (indirect) parent, and non-numeric or out-of-range percentages', async () => {
    const { magma, lastMessage } = await setUpStores();
    const domain = 'enterprise-attack';
    magma.importUseCases(stringify([
      { domain, level: 1, id: 'BIZ', name: 'b', inImpact: 0, thrImpact: 0, outImpact: 100 },
      { domain, level: 2, id: 'BIZ-1', name: 'ok', parentIds: ['BIZ'] },
      { domain, level: 2, id: 'SELF', name: 'self', parentIds: ['SELF'] },
      { domain, level: 2, id: 'A', name: 'a', parentIds: ['B'] },
      { domain, level: 2, id: 'B', name: 'b', parentIds: ['A'] },
      { domain, level: 3, id: 'TEXT', name: 't', parentIds: ['BIZ-1'], implementation: 'abc' },
      { domain, level: 3, id: 'NEGATIVE', name: 'n', parentIds: ['BIZ-1'], effectiveness: -5 },
      { domain, level: 3, id: 'TOO-HIGH', name: 'h', parentIds: ['BIZ-1'], visibility: 150 },
      { domain, level: 3, id: 'AS-TEXT', name: 'ok', parentIds: ['BIZ-1'], visibility: '50', implementation: 100, effectiveness: 100, visibilityFromAttackTechniqueOverride: true },
    ]));
    const imported = magma.useCases.filter((u: any) => !u.permanent).map((u: any) => u.id).sort();
    expect(imported).toEqual(['AS-TEXT', 'BIZ', 'BIZ-1']);
    const message = lastMessage();
    expect(message).toContain('Successful imports: 3. Failed imports: 6.');
    expect(message).toContain('"SELF" in domain "enterprise-attack" is its own (indirect) parent: SELF → SELF');
    expect(message).toContain('A → B → A');
    expect(message).toContain('implementation "abc" is not valid');
    expect(message).toContain('effectiveness "-5" is not valid');
    expect(magma.getUseCaseById('BIZ', domain)?.risk).toBeCloseTo(50); // Only AS-TEXT counts: 50% × 100% × 100%.
  });

  it('keeps use cases with an unknown parent ID, and warns about them', async () => {
    const { magma, lastMessage } = await setUpStores();
    magma.importUseCases(stringify([
      { domain: 'enterprise-attack', level: 2, id: 'DOS-1', name: 'd', parentIds: ['DOS'] },
      { domain: 'enterprise-attack', level: 3, id: 'DOS-1-1', name: 'typo', parentIds: ['DOS-l'] },
    ]));
    expect(magma.getUseCaseById('DOS-1-1', 'enterprise-attack')).toBeDefined();
    expect(lastMessage()).toContain('Successful imports: 2. Failed imports: 0.');
    expect(lastMessage()).toContain('"DOS-1-1" in domain "enterprise-attack" has parent "DOS-l", which does not exist');
    expect(lastMessage()).toContain('"DOS-1" in domain "enterprise-attack" has parent "DOS", which does not exist');
  });
});

describe('magma store: saving and loading', () => {
  it('saves a new L1 use case without NaN values, and loads it back with the same risk', async () => {
    const first = await setUpStores();
    first.magma.addNewUseCase(1, 'enterprise-attack');
    const created = first.magma.L1UseCases('enterprise-attack').at(-1)!;
    expect([created.inImpact, created.thrImpact, created.outImpact]).toEqual([100, 0, 0]);
    const saved = first.magma.exportUseCases();
    expect(saved).not.toMatch(/nan/i);

    const second = await setUpStores();
    second.magma.importUseCases(saved);
    const loaded = second.magma.getUseCaseById(created.id, 'enterprise-attack');
    expect(loaded?.risk).toBeCloseTo(created.risk!);
  });

  it('loads files saved by older versions, which could contain .nan for empty impacts', async () => {
    const { magma, lastMessage } = await setUpStores();
    magma.importUseCases('- domain: enterprise-attack\n  level: 1\n  id: L1-1\n  name: old\n  inImpact: 100\n  thrImpact: .nan\n  outImpact: .nan\n');
    expect(lastMessage()).toContain('Successful imports: 1. Failed imports: 0.');
    expect(magma.getUseCaseById('L1-1', 'enterprise-attack')?.risk).toBeCloseTo(100);
    expect(magma.exportUseCases()).not.toMatch(/nan/i);
  });
});

describe('magma store: renaming and deleting use cases', () => {
  let magma: any;
  const domain = 'enterprise-attack';
  const parentsOf = (id: string, inDomain = domain) => magma.getUseCaseById(id, inDomain)?.parentIds;

  beforeEach(async () => {
    magma = (await setUpStores()).magma;
    magma.importUseCases(readExample('magma_data_example.yaml'));
    magma.importUseCases(stringify([{ domain: 'mobile-attack', level: 3, id: 'M-1', name: 'm', parentIds: ['DOS-1'] }]));
  });

  it('moves the children along when an ID is renamed, within the same domain only', () => {
    const weightBefore = magma.getUseCaseById('DOS', domain).weight;
    expect(magma.renameUseCase(magma.getUseCaseById('DOS-1', domain).uid, 'DOS-A')).toBeNull();
    expect(parentsOf('DOS-1-1')).toEqual(['DOS-A']);
    expect(parentsOf('DOS-1-2')).toEqual(['DOS-A']);
    expect(magma.getUseCaseById('DOS', domain).weight).toBe(weightBefore);
    expect(parentsOf('M-1', 'mobile-attack')).toEqual(['DOS-1']);
  });

  it('refuses an empty ID, an ID that already exists, and renaming IN/THR, without changing anything', () => {
    const uid = magma.getUseCaseById('DOS-1', domain).uid;
    expect(magma.renameUseCase(uid, 'FIN-1')).toContain('already exists');
    expect(magma.renameUseCase(uid, '  ')).toContain('cannot be empty');
    expect(magma.renameUseCase(magma.getUseCaseById('IN', domain).uid, 'IN2')).toContain('cannot be renamed');
    expect(magma.getUseCaseById('DOS-1', domain)).toBeDefined();
    expect(parentsOf('DOS-1-1')).toEqual(['DOS-1']);
  });

  it('trims spaces around a new ID', () => {
    expect(magma.renameUseCase(magma.getUseCaseById('DOS-1', domain).uid, '  DOS-B ')).toBeNull();
    expect(parentsOf('DOS-1-1')).toEqual(['DOS-B']);
  });

  it('keeps the children when their parent is deleted (they lose their parent, decision D2)', () => {
    magma.removeUseCaseByUid(magma.getUseCaseById('DOS-1', domain).uid);
    expect(parentsOf('DOS-1-1')).toEqual(['DOS-1']);
    expect(magma.getUseCaseById('DOS', domain).weight).toBe(0);
  });
});
