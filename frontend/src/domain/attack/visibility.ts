// Visibility of ATT&CK techniques, based on the data components that a DeTT&CT file reports as available.
//
// ATT&CK lists no data components for some (sub-)techniques, for example reconnaissance that happens outside the
// defender's environment. Those cannot be detected via data sources, so they are left out of visibility averages
// and shown as a known blind spot instead (decision D7). A score of 100% therefore means: all data components that
// ATT&CK lists are available.

export interface TechniqueLike {
  data_components: string[];
  sub_techniques?: TechniqueLike[];
  visibility_ratio?: number;
}

/** Device completeness per data component name, as a fraction between 0 and 1 (the DeTT&CT score of 0-5, divided by 5). */
export type Completeness = Map<string, number>;

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

/** Whether ATT&CK lists data components for this (sub-)technique itself. */
export function hasDataComponents(technique: TechniqueLike): boolean {
  return technique.data_components.length > 0;
}

/** Whether a technique can be detected via data sources: it or one of its sub-techniques has data components. */
export function isDetectable(technique: TechniqueLike): boolean {
  return [technique, ...(technique.sub_techniques ?? [])].some(hasDataComponents);
}

/** Visibility (0-1) of a single (sub-)technique from its own data components, or null when ATT&CK lists none. */
export function ownVisibility(technique: TechniqueLike, completeness: Completeness): number | null {
  const components = [...new Set(technique.data_components)];
  if (components.length === 0) {
    return null;
  }
  const total = components.reduce((sum, name) => sum + (completeness.get(name) ?? 0), 0);
  return clamp(total / components.length);
}

/**
 * Visibility (0-1) of a technique: the average over the technique and its sub-techniques, counting only those that
 * have data components. Null when neither the technique nor any of its sub-techniques has data components.
 */
export function techniqueVisibility(technique: TechniqueLike, completeness: Completeness): number | null {
  const values = [technique, ...(technique.sub_techniques ?? [])]
    .map((item) => ownVisibility(item, completeness))
    .filter((value): value is number => value !== null);
  if (values.length === 0) {
    return null;
  }
  return clamp(values.reduce((sum, value) => sum + value, 0) / values.length);
}

/** Average visibility (0-100) over the techniques that can be detected via data sources, or null when there are none. */
export function averageVisibilityPercentage(techniques: TechniqueLike[]): number | null {
  const detectable = techniques.filter(isDetectable);
  if (detectable.length === 0) {
    return null;
  }
  return (detectable.reduce((sum, technique) => sum + (technique.visibility_ratio ?? 0), 0) / detectable.length) * 100;
}
