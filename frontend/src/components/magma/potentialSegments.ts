// The improvement potential of an L3 use case, split over visibility (red), implementation (green) and effectiveness
// (blue): each part is in proportion to how far that score is from 100%. Used by the two improvement potential charts.
export function potentialSegments(useCase: { visibility?: unknown; implementation?: unknown; effectiveness?: unknown; potential?: unknown }) {
  const visibility = Number(useCase.visibility);
  const implementation = Number(useCase.implementation);
  const effectiveness = Number(useCase.effectiveness);
  const potential = Number(useCase.potential);
  const missing = 300 - visibility - implementation - effectiveness;
  return [
    { value: ((100 - visibility) / missing) * potential, color: 'red' },
    { value: ((100 - implementation) / missing) * potential, color: 'green' },
    { value: ((100 - effectiveness) / missing) * potential, color: 'blue' },
  ];
}
