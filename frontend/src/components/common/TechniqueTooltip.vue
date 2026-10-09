<script setup lang="ts">
// The tooltip of a technique button in the DeTT&CT matrix or the MaGMa heatmap; the button gives the content. It is
// shown in the page body, not inside the scrolling matrix, and placed next to its button (see tooltipPlacement.ts).
// The mouse passes through a hovered tooltip, so moving quickly over the matrix never gets stuck on it. A pinned
// tooltip can be used (links, groups, components), and asks to be unpinned with Esc or a click elsewhere.
import { onMounted, onUnmounted, ref } from 'vue';
import { tooltipPlacement } from './tooltipPlacement';

const props = defineProps<{
  anchor: HTMLElement | null; // the technique button
  pinned: boolean;
}>();
const emit = defineEmits<{ unpin: [] }>();

const tooltip = ref<HTMLElement | null>(null);
const position = ref<{ left: number; top: number; maxHeight?: number }>({ left: 0, top: 0 });

// The button's box without its hover effect (the button is lifted and enlarged a little around its centre), so the
// tooltip does not move while that effect plays.
function buttonBox(button: HTMLElement) {
  const rect = button.getBoundingClientRect();
  const transform = getComputedStyle(button).transform;
  const shift = !transform || transform === 'none' ? { e: 0, f: 0 } : new DOMMatrixReadOnly(transform);
  return {
    left: rect.left + rect.width / 2 - shift.e - button.offsetWidth / 2,
    top: rect.top + rect.height / 2 - shift.f - button.offsetHeight / 2,
    width: button.offsetWidth,
    height: button.offsetHeight,
  };
}

function place() {
  if (!props.anchor || !tooltip.value) {
    return;
  }
  const style = getComputedStyle(tooltip.value);
  const height = tooltip.value.scrollHeight + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
  const window = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
  position.value = tooltipPlacement(buttonBox(props.anchor), { width: tooltip.value.offsetWidth, height }, window);
}

function onKeydown(event: KeyboardEvent) {
  if (props.pinned && (event.key === 'Escape' || event.key === 'Esc')) {
    emit('unpin');
  }
}

function onClick(event: MouseEvent) {
  const path = event.composedPath();
  if (props.pinned && !path.includes(tooltip.value!) && !(props.anchor && path.includes(props.anchor))) {
    emit('unpin');
  }
}

// The tooltip follows its button when the page or the matrix scrolls, or the window changes size.
onMounted(() => {
  place();
  window.addEventListener('scroll', place, { capture: true, passive: true });
  window.addEventListener('resize', place);
  window.addEventListener('keydown', onKeydown);
  document.addEventListener('click', onClick);
});

onUnmounted(() => {
  window.removeEventListener('scroll', place, { capture: true });
  window.removeEventListener('resize', place);
  window.removeEventListener('keydown', onKeydown);
  document.removeEventListener('click', onClick);
});
</script>

<template>
  <Teleport to="body">
    <div
      ref="tooltip"
      class="tooltip"
      :class="{ pinned }"
      :style="{
        left: `${position.left}px`,
        top: `${position.top}px`,
        maxHeight: position.maxHeight === undefined ? undefined : `${position.maxHeight}px`,
      }"
    >
      <slot />
    </div>
  </Teleport>
</template>

<style scoped>
.tooltip {
  position: fixed;
  z-index: 1002;
  width: 300px;
  overflow-y: auto; /* a tooltip taller than the window scrolls inside (once it is pinned) */
  pointer-events: none; /* the mouse passes through a hovered tooltip, to the techniques below it */
  background-color: rgba(93, 125, 152, 0.9);
  color: white;
  border: 1px solid black;
  padding: 4px 4px;
  border-radius: 4px;
  font-family: Inter, sans-serif;
  font-size: 11px;
  text-align: left;
  white-space: pre-line;
}

.tooltip.pinned {
  pointer-events: auto;
}
</style>
