// Where the tooltip of a technique button goes, in window coordinates: just below the button and a little to the right,
// or above the button when there is more room above (the button is in the lower half of the window). The direction
// depends only on where the button is, not on the tooltip's length, so neighbouring buttons get the same direction.
// The tooltip always stays inside the window, and gets at most the height of the room it has; the rest scrolls inside.

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

const GAP = 6; // between the button and the tooltip
const SHIFT = 16; // how far right of the button's left edge the tooltip starts
const MARGIN = 8; // room kept free at the edges of the window
const MIN_HEIGHT = 100; // the least height a tooltip gets, even in a very small window

export function tooltipPlacement(
  button: Box,
  tooltip: { width: number; height: number },
  window: { width: number; height: number },
) {
  const roomBelow = window.height - MARGIN - (button.top + button.height + GAP);
  const roomAbove = button.top - GAP - MARGIN;
  const above = roomAbove > roomBelow;
  const maxHeight = Math.max(above ? roomAbove : roomBelow, MIN_HEIGHT);
  return {
    left: Math.max(MARGIN, Math.min(button.left + SHIFT, window.width - MARGIN - tooltip.width)),
    top: above ? button.top - GAP - Math.min(tooltip.height, maxHeight) : button.top + button.height + GAP,
    maxHeight,
  };
}
