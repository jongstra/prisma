import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import fs from 'node:fs';
import { parse, stringify } from 'yaml';

vi.mock('sweetalert2', () => ({ default: { fire: () => Promise.resolve({}) } }));

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
  return { tactics, magma };
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
