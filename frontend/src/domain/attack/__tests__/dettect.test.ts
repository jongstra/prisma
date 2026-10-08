import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { parse } from 'yaml';
import { readDettectFile } from '../dettect';

const catalog = JSON.parse(fs.readFileSync('public/tactics_and_techniques_by_domain.json', 'utf8'));
const domainKey: Record<string, string> = { 'enterprise-attack': 'enterprise', 'mobile-attack': 'mobile', 'ics-attack': 'ics' };
const dataComponents = (domain: string) => catalog[domainKey[domain]].data_components.map((c: { name: string }) => c.name);
const readExample = (name: string) => parse(fs.readFileSync(`../examples/${name}`, 'utf8'));

const file = (dataSources: unknown[], overrides: Record<string, unknown> = {}) => ({
  version: 1.1, file_type: 'data-source-administration', domain: 'enterprise-attack', data_sources: dataSources, ...overrides,
});
const dataSource = (name: string, deviceCompleteness: unknown = 5) => ({
  data_source_name: name, data_source: [{ applicable_to: ['all'], data_quality: { device_completeness: deviceCompleteness } }],
});

describe('readDettectFile', () => {
  it('reads all example files of the repository', () => {
    for (const name of ['dettect/enterprise.yaml', 'dettect/enterprise_large.yaml',
      'dettect/enterprise_max_quality.yaml', 'dettect/mobile.yaml',
      'dettect/ics.yaml']) {
      const result = readDettectFile(readExample(name), dataComponents);
      expect(result.unknownDataSources, name).toEqual([]);
      expect(result.completeness.size, name).toBeGreaterThan(0);
    }
  });

  it('reads the device completeness as a fraction, with an empty score counting as 0', () => {
    const result = readDettectFile(file([dataSource('Process Creation', 4), dataSource('File Access', null)]), dataComponents);
    expect(result.completeness.get('Process Creation')).toBe(0.8);
    expect(result.completeness.get('File Access')).toBe(0);
  });

  it('lists data sources that ATT&CK does not know, and ignores them', () => {
    const result = readDettectFile(file([dataSource('Process Creation'), dataSource('Typo Source')]), dataComponents);
    expect(result.unknownDataSources).toEqual(['Typo Source']);
    expect([...result.completeness.keys()]).toEqual(['Process Creation']);
  });

  it('explains why a file cannot be used', () => {
    const cases: [unknown, string][] = [
      [parse(fs.readFileSync('../examples/magma/example.yaml', 'utf8')), 'not a DeTT&CT data source administration file'],
      [file([], { file_type: 'technique-administration' }), 'a DeTT&CT "technique-administration" file'],
      [file([], { file_type: undefined }), 'it has no file_type'],
      [file([], { domain: 'pre-attack' }), 'domain of the file ("pre-attack") is not supported'],
      [file([], { data_sources: undefined }), 'no list of data sources'],
      [readExample('dettect/enterprise_duplicate_data_sources.yaml'), 'Duplicate data sources found'],
      [file([{ data_source_name: 'Process Creation', data_source: [] }]), 'has no data quality scores'],
      [file([dataSource('Process Creation', 50)]), 'device_completeness "50" is not valid'],
      [file([dataSource('Process Creation', 'high')]), 'device_completeness "high" is not valid'],
      [file([{ data_source: [] }]), 'without a name'],
    ];
    for (const [data, message] of cases) {
      expect(() => readDettectFile(data, dataComponents), message).toThrow(message);
    }
  });
});
