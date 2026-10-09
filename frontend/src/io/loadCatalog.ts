// The ATT&CK catalog that tools/build_attack_catalog.ipynb generates: per domain, the tactics, techniques, groups,
// software and data components. It is served from frontend/public/.
const CATALOG_FILE = 'tactics_and_techniques_by_domain.json';

// Load the catalog. Throws an error when it cannot be loaded.
export async function loadCatalog() {
  const response = await fetch(CATALOG_FILE);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return response.json();
}
