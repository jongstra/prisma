// MaGMa 2.0 calculations (functional documentation, sections 3.1.2 and 3.3):
//
// - L3 (detection rule): weight = visibility × implementation × effectiveness (as percentages); potential = 100 − weight.
// - L2 and L1: visibility, implementation, effectiveness and weight are the averages over their child use cases (the
//   use cases in the same domain that list them as parent); potential = 100 − weight. Cumulative IN and THROUGH are the
//   L1 use cases with uid 'IN' and 'THR'.
// - Risk of a business L1 use case = 100% − (cumulative IN weight × IN impact + cumulative THROUGH weight × THROUGH
//   impact + its own weight × OUT impact).
//
// All use cases are recalculated together: children before parents, then the risks. A change anywhere, for example
// under cumulative IN, therefore always reaches every value that depends on it.

export interface MagmaUseCase {
  domain: string;
  level: number;
  id: string;
  uid?: string;
  parentIds?: string[] | unknown;
  permanent?: boolean;
  visibility?: number | string | null;
  implementation?: number | string | null;
  effectiveness?: number | string | null;
  weight?: number | null;
  potential?: number | null;
  inImpact?: number | string | null;
  thrImpact?: number | string | null;
  outImpact?: number | string | null;
  risk?: number;
}

type AveragedField = 'visibility' | 'implementation' | 'effectiveness' | 'weight';

/** A percentage (0-100, possibly typed in as text) as a fraction (0-1). Missing values count as 0. */
const fraction = (value: unknown) => Number(value ?? 0) / 100;

/** Recalculate the derived values (weight, potential, L1/L2 averages and L1 risk) of all use cases, in place. */
export function recalculateUseCases(useCases: MagmaUseCase[]): void {
  const useCasesByDomain = new Map<string, MagmaUseCase[]>();
  for (const useCase of useCases) {
    if (!useCasesByDomain.has(useCase.domain)) {
      useCasesByDomain.set(useCase.domain, []);
    }
    useCasesByDomain.get(useCase.domain)!.push(useCase);
  }
  for (const domainUseCases of useCasesByDomain.values()) {
    recalculateDomain(domainUseCases);
  }
}

function recalculateDomain(useCases: MagmaUseCase[]): void {
  // Child use cases per parent ID.
  const childrenByParentId = new Map<string, MagmaUseCase[]>();
  for (const useCase of useCases) {
    if (!Array.isArray(useCase.parentIds)) {
      continue;
    }
    for (const parentId of useCase.parentIds) {
      if (!childrenByParentId.has(parentId)) {
        childrenByParentId.set(parentId, []);
      }
      childrenByParentId.get(parentId)!.push(useCase);
    }
  }

  // Weights and averages, children before parents. Each use case is calculated once; in a (invalid) cycle of parents,
  // the use case that closes the cycle contributes the value it has at that moment instead of recursing forever.
  const visited = new Set<MagmaUseCase>();
  const calculate = (useCase: MagmaUseCase) => {
    if (visited.has(useCase)) {
      return;
    }
    visited.add(useCase);

    if (useCase.level === 3) {
      useCase.weight = fraction(useCase.visibility) * fraction(useCase.implementation) * fraction(useCase.effectiveness) * 100;
    } else {
      const children = childrenByParentId.get(useCase.id) ?? [];
      children.forEach(calculate);
      const average = (field: AveragedField) =>
        children.reduce((sum, child) => sum + (Number(child[field]) || 0), 0) / children.length || 0;
      useCase.visibility = average('visibility');
      useCase.implementation = average('implementation');
      useCase.effectiveness = average('effectiveness');
      useCase.weight = average('weight');
    }
    useCase.potential = 100 - (useCase.weight ?? 0);
  };
  useCases.forEach(calculate);

  // Risks of the business L1 use cases, now that cumulative IN and THROUGH are up to date.
  const inWeight = useCases.find((useCase) => useCase.uid === 'IN')?.weight ?? 0;
  const thrWeight = useCases.find((useCase) => useCase.uid === 'THR')?.weight ?? 0;
  for (const useCase of useCases) {
    if (useCase.level === 1 && !useCase.permanent) {
      const inRisk = fraction(useCase.inImpact) * fraction(inWeight);
      const thrRisk = fraction(useCase.thrImpact) * fraction(thrWeight);
      const outRisk = fraction(useCase.outImpact) * fraction(useCase.weight);
      useCase.risk = Math.max(0, 1 - (inRisk + thrRisk + outRisk)) * 100;
    }
  }
}
