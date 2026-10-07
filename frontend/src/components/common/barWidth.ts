// Width of a horizontal bar in the insight charts, as a CSS value relative to the bar container.
// `max` is the value that fills the container: the largest value in the chart for counts, or 100 for percentages.
// `labelSpace` is kept free to the right of the longest bar for the number label, so bars never leave their box.
export function barWidth(value: number, max: number, labelSpace = '40px'): string {
  const fraction = max > 0 ? Math.min(Math.max((Number(value) || 0) / max, 0), 1) : 0;
  return `calc((100% - ${labelSpace}) * ${fraction})`;
}
