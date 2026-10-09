import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadCatalog } from '../loadCatalog';

afterEach(() => vi.unstubAllGlobals());

describe('loadCatalog', () => {
  it('loads the ATT&CK catalog', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ enterprise: { tactics: [] } }) })));
    expect(await loadCatalog()).toEqual({ enterprise: { tactics: [] } });
    expect(fetch).toHaveBeenCalledWith('tactics_and_techniques_by_domain.json');
  });

  it('explains when the catalog cannot be loaded', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' })));
    await expect(loadCatalog()).rejects.toThrow('HTTP 404 Not Found');
  });
});
