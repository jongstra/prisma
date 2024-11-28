<script setup lang="ts">
import { computed, ref, watch, reactive, onMounted, onBeforeUnmount } from 'vue';
import { tacticsStore } from '@/stores/tactics';
import { v4 as uuidv4 } from 'uuid';

const store = tacticsStore();
const props = defineProps(['technique']);
const id = uuidv4();

let showTooltipBool = ref(false);

let domain;
if (store.domain === 'enterprise-attack') {
  domain = reactive(store.enterprise);
} else if (store.domain === 'mobile-attack') {
  domain = reactive(store.mobile);
} else if (store.domain === 'ics-attack') {
  domain = reactive(store.ics);
}

// Calculate the tooltip position, and update it when the button location would be modified.
const buttonRef = ref<HTMLElement | null>(null);
let tooltipPosition = ref({ top: 0, left: 0 });
watch(buttonRef, (buttonRef) => {
  if (buttonRef) {
    const buttonRect = buttonRef.getBoundingClientRect();
    tooltipPosition.value.top = buttonRect.bottom - 272; // Position below the button
    tooltipPosition.value.left = buttonRect.left + (buttonRect.width / 2) - 70; // Center the tooltip horizontally
  }
});

// Watch for changes in store.pinnedTooltipId
watch(() => store.pinnedTooltipId, (newPinnedTooltipId) => {
  if (newPinnedTooltipId !== id) {
    showTooltipBool.value = false;
  }
});

const toggleTooltipPinning = () => {
  if (store.pinnedTooltipId === id) {
    store.pinnedTooltipId = '';
  } else {
    store.pinnedTooltipId = id;
  }
};

const showTooltip = () => {
  if (store.pinnedTooltipId === '' && buttonRef) {
    showTooltipBool.value = true;
  }
};

const hideTooltip = () => {
  if (store.pinnedTooltipId === '') {
    showTooltipBool.value = false;
  }
};

const toggleGroupSelected = (groupName: string) => {
  domain.groups.forEach(group => {
    if (group.name === groupName) {
      group.selected = !group.selected;
    }
  });
};

const hoverGroup = (groupName: string) => {
  console.log(`entered ${groupName}`);
  domain.groups.forEach(group => {
    if (group.name === groupName) {
      group.hovered = true;
    }
  });
};

// Attach methods to the window object
window.hoverGroup = hoverGroup;
window.toggleGroupSelected = toggleGroupSelected;

const getTooltipText = () => {
  const subtechniques_string = props.technique.sub_techniques 
    ? `Subtechniques:\n${props.technique.sub_techniques.map(sub => `- ${sub.name}`).join('\n')}`
    : 'No Subtechniques';

  const groups_string = props.technique.groups.length > 0 
    ? `Groups<br>`
    : "No Groups";

  let components_string = '';
  const visible_components = store.visibleAttributes('data_components');
  const total_components_detecting_technique = props.technique.data_components.length;
  let visible_components_count = 0;
  props.technique.data_components.forEach((component) => {
    if (visible_components.includes(component)) {
      visible_components_count += 1;
      components_string += `- ${component}<br>`;
    } 
  });
  components_string = `(${visible_components_count} of ${total_components_detecting_technique})` +
                        ((components_string.length > 0) ? ':' : '') + `<br>` + components_string;

  return `
      ${props.technique.name}<br><br>
      ID: ${props.technique.external_id}
      <br>----<br>
      ${subtechniques_string}
      <br>----<br>
      <div>Nr groups using: ${props.technique.occurrence_groups}</div>
      <div>Nr software using: ${props.technique.occurrence_software}</div>
      <div>Total occurrence: ${props.technique.occurrence_total}</div>
      ----<br>
      <div>Components visible ${components_string}</div>
      ----<br>
      ${groups_string}
  `.replace(/\s+/g, ' ').trim();
};

function getButtonStyles(visibility_ratio: number) {
  let backgroundColor = '';
  let color = 'black'; // Default text color

  if (visibility_ratio <= 0.01) {
    backgroundColor = '';
  } else if (visibility_ratio <= 0.25) {
    backgroundColor = '#E1BEE7';
  } else if (visibility_ratio <= 0.5) {
    backgroundColor = '#CE93D8';
  } else if (visibility_ratio <= 0.75) {
    backgroundColor = '#AB47BC';
  } else if (visibility_ratio <= 0.99) {
    backgroundColor = '#7B1FA2';
    color = 'white'; // White text color for high visibility ratios
  } else {
    backgroundColor = '#4A148C';
    color = 'white'; // White text color for highest visibility ratio
  }

  return { backgroundColor, color };
}

const showButton = computed(() => {
  const platforms = props.technique?.platforms || [];

  let platformFilterResult = (
    (platforms.some(platform => store.activeAttributes('platforms').includes(platform))) && 
    (!store.searchQuery || props.technique.name.toLowerCase().includes(store.searchQuery.toLowerCase()))
  );

  let techniqueVisibilityPercentageFilterResult = (
    (props.technique.visibility_ratio >= store.minVisibilityRatio) &&
    (props.technique.visibility_ratio <= store.maxVisibilityRatio)
  );

  let techniqueTotalOccurrencesFilterResult = (
    props.technique.occurrence_total >= store.minTotalOccurrences
  );

  return platformFilterResult && techniqueVisibilityPercentageFilterResult && techniqueTotalOccurrencesFilterResult;
});

const occursInHoveredGroups = () => {
  if (store.hoveredGroupsTechniquesSet.has(props.technique.name)) {
    return true
  } else {
    return false
  }
};

const occursInSelectedGroups = () => {
  if (store.selectedGroupsTechniquesSet.has(props.technique.name)) {
    return true
  } else {
    return false
  }
};

</script>



<template>
  <button v-if="showButton"
    ref="buttonRef"
    :style="getButtonStyles(technique.visibility_ratio)"
    @click="toggleTooltipPinning"
    @mouseover="showTooltip"
    @mouseleave="hideTooltip"
    :class="{ pinned: store.pinnedTooltipId === id, 'occurs-in-hovered-groups': occursInHoveredGroups(), 'occurs-in-selected-groups': occursInSelectedGroups() }"
  >
    <span class="buttontext">{{ technique.name }}</span>
  </button>

  <!-- Tooltip positioned relative to the button -->
  <div v-if="showTooltipBool || store.pinnedTooltipId === id" class="tooltip"
       :style="{ top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px` }"
  >
    <div v-html="getTooltipText()"></div>
    <div v-if="props.technique.groups.length > 0">
      <label v-for="group in props.technique.groups" :key="group" for="${group}-${Math.random()}" style="display: inline-flex; align-items: center; margin-right: 5px;">
        <span 
          class="group-box"
          :style="{
            display: 'inline-block',
            padding: '5px 5px',
            marginLeft: '1px',
            marginTop: '2px',
            marginBottom: '2px',
            backgroundColor: 'gray',
            borderColor: domain.groups.find(g => g.name === group)?.selected ? 'rgb(230, 0, 0)' : '#ccc',
            borderWidth: '1.5px',
            borderStyle: 'solid',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s, border-color 0.2s',
            fontSize: '11px'
          }"
          @mouseover="hoverGroup(group)"
          @click="toggleGroupSelected(group)">
          {{ group }}
        </span>
      </label>
    </div>
  </div>
</template>




<style scoped>
button {
  margin-top: 0px;
  margin-bottom: 0px;
  background-color: rgb(246, 246, 246);
  border: 2px solid rgb(42, 42, 42);
  border-radius: 4px; /* Slightly rounded corners */
  transition: transform 0.1s ease, box-shadow 0.1s ease; /* Smooth transition for hover effects */
  position: relative; /* Ensure the button's stacking context is isolated */
}

button:hover,
button.pinned {
  transform: translate(1px, -2px); /* Move button slightly to the right and upwards on hover */
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.7); /* Add a shadow */
  filter: brightness(0.88); /* Slightly darken the button on hover */
  outline: 2px solid rgb(57, 55, 139);  /* Change the border color on hover */
}

button.occurs-in-selected-groups {
  border: 2px solid rgb(255, 0, 0);  /* Change the border color on group select */
  /* box-shadow: 0 0 10px 5px rgba(0,0,0,0.5); */
}

button.occurs-in-hovered-groups {
  /* border: 2px solid rgb(255, 192, 1); */
  box-shadow: 0 0 10px 5px rgba(0,0,0,0.5);
}

.buttontext {
  width: 125px;
  height: 24px;
  font-size: 10.5px;
  overflow: hidden;
  display: block;
  text-overflow: ellipsis;
  text-align: center;
}

.tooltip {
  position: fixed; /* Use fixed positioning for better control */
  background-color: rgba(93, 125, 152, 0.9);
  color: white;
  border: 1px solid black;
  padding: 4px 4px;
  border-radius: 4px;
  font-size: 11px;
  z-index: 1002; /* Ensure tooltip is always on top */
  width: 171px;
  text-align: left;
  white-space: pre-line;
}

/* .group-box {
  display: inline-block;
  padding: 5px 5px;
  margin-left: '1px';
  margin-top: '2px';
  margin-bottom: '2px';
  background-color: gray;
  border-width: '1px';
  border-style: 'solid';
  border-radius: '4px';
  cursor: 'pointer';
  transition: background-color 0.2s, border-color 0.2s;
  font-size: '11px';
}

.group-box.selected {
  border-color: #FF0000;
} */

</style>