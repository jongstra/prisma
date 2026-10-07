// Style for techniques for which ATT&CK lists no data components: a known blind spot that cannot be detected via
// data sources (rather than missing visibility). Shared by the matrix buttons and the visibility legend.
export const NOT_DETECTABLE_STYLE = {
  backgroundImage: 'repeating-linear-gradient(135deg, #dcdcdc 0 4px, #f6f6f6 4px 8px)',
  color: '#666666',
};

export const NOT_DETECTABLE_TEXT = 'n/a: ATT&CK lists no data components for this technique, so it cannot be detected via data sources';
