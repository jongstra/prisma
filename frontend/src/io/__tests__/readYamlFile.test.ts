import { describe, it, expect } from 'vitest';
import { isYamlFile, readYamlFile } from '../readYamlFile';
import './blobText';

describe('readYamlFile', () => {
  it('recognises a YAML file by its type or its extension', () => {
    expect(isYamlFile(new File([''], 'data.yaml'))).toBe(true);
    expect(isYamlFile(new File([''], 'DATA.YML'))).toBe(true);
    expect(isYamlFile(new File([''], 'data', { type: 'application/x-yaml' }))).toBe(true);
    expect(isYamlFile(new File([''], 'notes.txt', { type: 'text/plain' }))).toBe(false);
  });

  it('reads the YAML in a file, and explains when it is not valid YAML', async () => {
    expect(await readYamlFile(new File(['a: 1\nb: [2, 3]'], 'data.yaml'))).toEqual({ a: 1, b: [2, 3] });
    await expect(readYamlFile(new File(['a: [oops'], 'data.yaml'))).rejects.toThrow('The file is not valid YAML: ');
  });
});
