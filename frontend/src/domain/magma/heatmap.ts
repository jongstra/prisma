// Values for the MaGMa heatmap: per ATT&CK technique, based on the L3 use cases that detect it.

export interface HeatmapMetrics {
  visibility: boolean;
  implementation: boolean;
  effectiveness: boolean;
}

interface UseCaseLike {
  domain: string;
  level: number;
  id: string;
  uid?: string;
  parentIds?: unknown;
  visibility?: unknown;
  implementation?: unknown;
  effectiveness?: unknown;
}

const fraction = (value: unknown) => (Number(value) || 0) / 100;

/**
 * The heatmap value (0-100) of a technique: the average, over its L3 use cases, of the product of the selected metrics.
 * With all three metrics selected this is the average weight. Null when there are no use cases or no metric is selected.
 */
export function heatmapValue(useCases: UseCaseLike[], metrics: HeatmapMetrics): number | null {
  const selected = (['visibility', 'implementation', 'effectiveness'] as const).filter((metric) => metrics[metric]);
  if (useCases.length === 0 || selected.length === 0) {
    return null;
  }
  const total = useCases.reduce((sum, useCase) => sum + selected.reduce((product, metric) => product * fraction(useCase[metric]), 1), 0);
  return (total / useCases.length) * 100;
}

/** The number of distinct L2 and L1 use cases above the given use cases (following parents within the same domain). */
export function ancestorCounts(useCases: UseCaseLike[], allUseCases: UseCaseLike[]): { l2: number; l1: number } {
  const byId = new Map<string, UseCaseLike[]>();
  for (const useCase of allUseCases) {
    const key = `${useCase.domain}|${useCase.id}`;
    byId.set(key, [...(byId.get(key) ?? []), useCase]);
  }
  const ancestors = new Set<UseCaseLike>();
  const queue = [...useCases];
  while (queue.length > 0) {
    const useCase = queue.pop()!;
    const parentIds = Array.isArray(useCase.parentIds) ? useCase.parentIds : [];
    for (const parent of parentIds.flatMap((id) => byId.get(`${useCase.domain}|${id}`) ?? [])) {
      if (!ancestors.has(parent)) {
        ancestors.add(parent);
        queue.push(parent);
      }
    }
  }
  const levels = [...ancestors].map((useCase) => useCase.level);
  return { l2: levels.filter((level) => level === 2).length, l1: levels.filter((level) => level === 1).length };
}
