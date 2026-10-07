// Validation of MaGMa use cases, for example when they are imported from a YAML file.

export interface UseCaseReference {
  domain: string;
  id: string;
  parentIds?: unknown;
}

/** The parent IDs of a use case. 'none' is what the editor stores when "None" is selected as parent. */
function parentIdsOf(useCase: UseCaseReference): string[] {
  return Array.isArray(useCase.parentIds)
    ? useCase.parentIds.filter((id): id is string => typeof id === 'string' && id !== '' && id !== 'none')
    : [];
}

/**
 * Checks a percentage (visibility, implementation, effectiveness, IN/THR/OUT impact). It may be empty, or a number from
 * 0 to 100, also when typed as text ("50"). Returns a description of the problem, or null when the value is valid.
 */
export function percentageProblem(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const number = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  if (!Number.isFinite(number) || number < 0 || number > 100) {
    return 'it must be a number from 0 to 100';
  }
  return null;
}

/**
 * Finds the use cases that are their own parent, directly or via other use cases (A → B → A). Their values cannot be
 * calculated. Returns, per such use case, the path back to itself.
 */
export function findParentCycles<T extends UseCaseReference>(useCases: T[]): Map<T, string[]> {
  const key = (domain: string, id: string) => `${domain}|${id}`;
  const useCasesById = new Map<string, T[]>();
  for (const useCase of useCases) {
    const k = key(useCase.domain, useCase.id);
    if (!useCasesById.has(k)) {
      useCasesById.set(k, []);
    }
    useCasesById.get(k)!.push(useCase);
  }

  const cycles = new Map<T, string[]>();
  for (const start of useCases) {
    // Follow the parents from the start use case; reaching its own ID again means a cycle.
    const seen = new Set<T>();
    const stack: { useCase: T; path: string[] }[] = [{ useCase: start, path: [start.id] }];
    search: while (stack.length > 0) {
      const { useCase, path } = stack.pop()!;
      for (const parentId of parentIdsOf(useCase)) {
        if (parentId === start.id) {
          cycles.set(start, [...path, parentId]);
          break search;
        }
        for (const parent of useCasesById.get(key(start.domain, parentId)) ?? []) {
          if (!seen.has(parent)) {
            seen.add(parent);
            stack.push({ useCase: parent, path: [...path, parentId] });
          }
        }
      }
    }
  }
  return cycles;
}

/** Lists the parent IDs that do not exist in the use case's domain. */
export function findUnknownParents<T extends UseCaseReference>(useCases: T[]): { useCase: T; parentId: string }[] {
  const ids = new Set(useCases.map((useCase) => `${useCase.domain}|${useCase.id}`));
  return useCases.flatMap((useCase) =>
    parentIdsOf(useCase)
      .filter((parentId) => !ids.has(`${useCase.domain}|${parentId}`))
      .map((parentId) => ({ useCase, parentId })),
  );
}
