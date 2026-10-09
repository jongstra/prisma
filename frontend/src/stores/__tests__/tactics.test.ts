import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import fs from 'node:fs';
import { parse } from 'yaml';
import { tacticsStore } from '../tactics';
import { isDetectable } from '@/domain/attack/visibility';

const catalog = JSON.parse(fs.readFileSync('public/tactics_and_techniques_by_domain.json', 'utf8'));
const readExample = (name: string) => parse(fs.readFileSync(`../examples/${name}`, 'utf8'));

describe('tactics store: processDettectYaml', () => {
  let store: ReturnType<typeof tacticsStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = tacticsStore();
    const copy = structuredClone(catalog);
    store.enterprise = copy.enterprise;
    store.mobile = copy.mobile;
    store.ics = copy.ics;
  });

  it('gives every detectable technique and sub-technique exactly 100% with the maximum-quality file', () => {
    store.processDettectYaml(readExample('dettect/enterprise_max_quality.yaml'));
    // The store types `enterprise` as a list, while it holds one domain object (fixed in the type clean-up).
    const enterprise: any = store.enterprise;
    for (const tactic of enterprise.tactics) {
      for (const technique of tactic.techniques) {
        if (isDetectable(technique)) {
          expect(technique.visibility_ratio, `${technique.external_id} in ${tactic.name}`).toBe(1);
        }
        for (const sub of technique.sub_techniques ?? []) {
          if (sub.data_components.length > 0) {
            expect(sub.visibility_ratio, sub.external_id).toBe(1);
          }
        }
      }
    }
  });
});

describe('tactics store: loading a DeTT&CT file safely', () => {
  let store: ReturnType<typeof tacticsStore>;
  const ratio = (id: string) => (store.enterprise as any).tactics.flatMap((t: any) => t.techniques).find((t: any) => t.external_id === id).visibility_ratio;
  const dettect = (dataSources: unknown[]) => ({ version: 1.1, file_type: 'data-source-administration', domain: 'enterprise-attack', data_sources: dataSources });
  const dataSource = (name: string, deviceCompleteness: unknown) => ({ data_source_name: name, data_source: [{ applicable_to: ['all'], data_quality: { device_completeness: deviceCompleteness } }] });

  beforeEach(() => {
    setActivePinia(createPinia());
    store = tacticsStore();
    const copy = structuredClone(catalog);
    store.enterprise = copy.enterprise;
    store.mobile = copy.mobile;
    store.ics = copy.ics;
    store.processDettectYaml(readExample('dettect/enterprise_large.yaml'));
  });

  it('changes nothing when a file has a problem', () => {
    const before = ratio('T1595');
    expect(before).toBeGreaterThan(0);
    expect(() => store.processDettectYaml(dettect([dataSource('Process Creation', 50)]))).toThrow('device_completeness "50" is not valid');
    expect(() => store.processDettectYaml(readExample('magma/example.yaml'))).toThrow('not a DeTT&CT data source administration file');
    expect(() => store.processDettectYaml(null)).toThrow('not a DeTT&CT data source administration file');
    expect(ratio('T1595')).toBe(before);
    expect(store.domain).toBe('enterprise-attack');
  });

  it('ignores data sources that ATT&CK does not know, and reports them', () => {
    const result = store.processDettectYaml(dettect([dataSource('Network Traffic Content', 5), dataSource('Typo Source', 5)]));
    expect(result.unknownDataSources).toEqual(['Typo Source']);
    expect(ratio('T1595')).toBeGreaterThan(0); // Active Scanning is visible through Network Traffic Content.
  });

  it('passes the error on when the ATT&CK data cannot be loaded (App.vue shows the message)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' })));
    await expect(store.fetchTactics()).rejects.toThrow('HTTP 404 Not Found');
    vi.unstubAllGlobals();
    expect(store.dataLoaded).toBe(true);
  });
});
