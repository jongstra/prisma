import { computed, onUnmounted, ref, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { tacticsStore } from '@/stores/tactics';

// The tooltip state of one technique button, in the DeTT&CT matrix or the MaGMa heatmap. Hovering the button shows its
// tooltip; a click pins it, so it stays open and can be used, until it is unpinned (a click on the button again, Esc, or
// a click elsewhere). One tooltip can be pinned at a time, and while one is pinned, hovering other buttons shows nothing.
export function useTechniqueTooltip() {
  const store = tacticsStore();
  const id = uuidv4();
  const hovered = ref(false);
  const pinned = computed(() => store.pinnedTooltipId === id);
  const open = computed(() => hovered.value || pinned.value);

  // A tooltip that is unpinned, or loses the pin to another tooltip, stays closed until its button is hovered again.
  watch(() => store.pinnedTooltipId, (pinnedId) => {
    if (pinnedId !== id) {
      hovered.value = false;
    }
  });

  // A pinned tooltip whose button disappears (for example on another page) is unpinned, so other tooltips show again.
  onUnmounted(() => {
    if (pinned.value) {
      store.pinnedTooltipId = '';
    }
  });

  return {
    open,
    pinned,
    show: () => {
      if (store.pinnedTooltipId === '') {
        hovered.value = true;
      }
    },
    hide: () => {
      hovered.value = false;
    },
    togglePin: () => {
      store.pinnedTooltipId = pinned.value ? '' : id;
    },
    unpin: () => {
      if (pinned.value) {
        store.pinnedTooltipId = '';
      }
    },
  };
}
