import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import fs from 'node:fs';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn(() => Promise.resolve({})) } }));

const catalog = JSON.parse(fs.readFileSync('public/tactics_and_techniques_by_domain.json', 'utf8'));
const domain = 'enterprise-attack';

// Shows the table of one level, with the default use cases plus one new use case on that level. The magma store creates
// the tactics store when its module loads, so the stores and the table are imported after Pinia is active.
async function showTable(level: 'L1' | 'L2' | 'L3') {
  vi.resetModules();
  const pinia = createPinia();
  setActivePinia(pinia);
  const tactics = (await import('@/stores/tactics')).tacticsStore();
  tactics.enterprise = structuredClone(catalog.enterprise);
  const magma = (await import('@/stores/magma')).magmaStore();
  magma.initializeDefaultUseCases();
  magma.addNewUseCase(Number(level[1]), domain);
  magma.activeTab = level;
  const UseCaseTable = (await import('../UseCaseTable.vue')).default;
  const table = mount(UseCaseTable, { global: { plugins: [pinia] } });
  const headers = () => table.findAll('thead th').slice(1).map((th) => th.text()); // without the delete-all column
  const cell = (row: number, header: string) => table.findAll('tbody tr').at(row)!.findAll('td').at(headers().indexOf(header) + 1)!;
  return { magma, table, headers, cell };
}

describe('UseCaseTable', () => {
  it('shows the columns of the active level', async () => {
    expect((await showTable('L1')).headers()).toEqual(['ID', 'Use Case Name', 'Description', 'L2 UC Related', 'L3 UC Related',
      'Visibility %', 'Implementation %', 'Effectiveness %', 'Weight %', 'Potential %', 'IN Impact %', 'THR Impact %', 'OUT Impact %', 'Risk']);
    expect((await showTable('L2')).headers()).toEqual(['ID', 'Use Case Name', 'Description', 'Parent Use Case', 'L3 UC Related',
      'Visibility %', 'Implementation %', 'Effectiveness %', 'Weight %', 'Potential %']);
    expect((await showTable('L3')).headers()).toEqual(['ID', 'Use Case Name', 'Description', 'Parent Use Case', 'Data Source',
      'ATT&CK Technique', 'Override', 'Visibility %', 'Implementation %', 'Effectiveness %', 'Weight %', 'Potential %']);
  });

  it('locks the permanent IN and THR use cases, and marks impacts that do not add up to 100', async () => {
    const { table, magma, cell } = await showTable('L1');
    const rows = table.findAll('tbody tr').filter((row) => row.find('td.remove-col').exists()); // without the averages
    expect(rows.map((row) => row.find('button.remove-button').exists())).toEqual([false, false, true]);
    expect(cell(0, 'ID').find('input').attributes('disabled')).toBeDefined();
    expect(cell(0, 'IN Impact %').find('input').attributes('disabled')).toBeDefined();
    expect(cell(2, 'ID').find('input').attributes('disabled')).toBeUndefined();
    expect(cell(2, 'Visibility %').find('.uneditable').exists()).toBe(true); // calculated from the levels below

    const useCase = magma.L1UseCases(domain).at(-1)!;
    magma.updateUseCase(useCase.uid, { inImpact: 50, thrImpact: 20, outImpact: 30 } as never, domain);
    await table.vm.$nextTick();
    expect(cell(2, 'IN Impact %').find('input').element.style.backgroundColor).toBe('white');
    magma.updateUseCase(useCase.uid, { outImpact: 40 } as never, domain);
    await table.vm.$nextTick();
    expect(cell(2, 'IN Impact %').find('input').element.style.backgroundColor).toBe('crimson');
  });

  it('lets the visibility of an L3 use case be edited, unless it comes from its technique', async () => {
    const { table, magma, cell } = await showTable('L3');
    const visibility = () => cell(0, 'Visibility %').find('input').attributes('disabled');
    expect(visibility()).toBeUndefined();
    const useCase = magma.L3UseCases(domain)[0];
    magma.updateUseCase(useCase.uid, { attackTechniqueId: 'T1059' }, domain);
    await table.vm.$nextTick();
    expect(visibility()).toBeDefined();
    magma.updateUseCase(useCase.uid, { visibilityFromAttackTechniqueOverride: true }, domain);
    await table.vm.$nextTick();
    expect(visibility()).toBeUndefined();
  });

  it('keeps each row with its use case when a row above it is deleted', async () => {
    const { table, magma } = await showTable('L2');
    magma.addNewUseCase(2, domain);
    await table.vm.$nextTick();
    const [first, second] = magma.L2UseCases(domain);
    const rowOf = (id: string) => table.findAll('tbody tr')
      .find((row) => row.find('input').exists() && (row.find('input').element as HTMLInputElement).value === id)?.element;
    const secondRow = rowOf(second.id);
    magma.removeUseCaseByUid(first.uid);
    await table.vm.$nextTick();
    expect(rowOf(second.id)).toBe(secondRow);
  });

  it('shows the averages only on L1', async () => {
    expect((await showTable('L1')).table.text()).toContain('Averages');
    expect((await showTable('L2')).table.text()).not.toContain('Averages');
  });
});
