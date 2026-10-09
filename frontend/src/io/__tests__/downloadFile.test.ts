import { describe, it, expect, vi, afterEach } from 'vitest';
import { downloadFile } from '../downloadFile';
import './blobText';

afterEach(() => vi.restoreAllMocks());

describe('downloadFile', () => {
  it('offers the text as a file with the given name and type', async () => {
    let blob: Blob | undefined;
    let link: HTMLAnchorElement | undefined;
    URL.createObjectURL = (object: Blob | MediaSource) => { blob = object as Blob; return 'blob:test'; };
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { link = this; });

    downloadFile('a: 1', 'data.yaml', 'text/yaml');

    expect(link?.download).toBe('data.yaml');
    expect(link?.href).toBe('blob:test');
    expect(blob?.type).toBe('text/yaml');
    expect(await blob?.text()).toBe('a: 1');
    expect(document.body.contains(link!)).toBe(false); // the temporary link is removed again
  });
});
