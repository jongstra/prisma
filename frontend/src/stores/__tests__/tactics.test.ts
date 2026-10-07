import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import fs from 'node:fs';
import { parse } from 'yaml';
import { tacticsStore } from '../tactics';
import { isDetectable } from '@/domain/attack/visibility';

const catalog = JSON.parse(fs.readFileSync('public/tactics_and_techniques_by_domain.json', 'utf8'));
const readExample = (name: string) => parse(fs.readFileSync(`../example_data_dettect/${name}`, 'utf8'));

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
    store.processDettectYaml(readExample('dettect_editor_data_sources_example_enterprise ALL MAX QUALITY.yaml'));
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
