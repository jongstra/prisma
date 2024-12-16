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

// console.log(domain.tactics.reduce((sum, tactic) => {
//   sum += tactic.techniques.length;
//   return sum; // Return the updated sum
// }, 0)); // Initialize sum to 0

// Calculate the tooltip position, and update it when the button location would be modified.
const buttonRef = ref<HTMLElement | null>(null);
let tooltipPosition = ref({ top: 0, left: 0 });

// Function to calculate the cumulative scroll positions of all ancestors.
const calculateScroll = (e) => {
  if (e && e.parentNode) {
    const [scrollTop, scrollLeft] = calculateScroll(e.parentNode);
    return [(e.scrollTop || 0) + scrollTop, (e.scrollLeft || 0) + scrollLeft];
  } else {
    return [0, 0];
  }
};

// Update the tooltip position relative to the document.
const updateTooltipPosition = () => {
  // The !(store.pinnedTooltipId === id) part keeps the tooltip in place after making it visible.
  // Without this part of the check, the tooltip would move due to the changed location
  // caused by the hover translate effect.
  if ((buttonRef.value) && !(store.pinnedTooltipId === id)) {
    const buttonRect = buttonRef.value.getBoundingClientRect();
    const [scrollTop, scrollLeft] = calculateScroll(buttonRef.value);

    // Adjust tooltip position to be relative to the document
    tooltipPosition.value.top = buttonRect.bottom + scrollTop - 273; // Position below the button
    tooltipPosition.value.left = buttonRect.left + scrollLeft; // Position the tooltip horizontally
  }
};

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
  if (buttonRef.value) {
    updateTooltipPosition();
    if (store.pinnedTooltipId === '') {
      showTooltipBool.value = true;
    }
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
    ? `Subtechniques:\n${props.technique.sub_techniques.map(
      sub => `<a href='https://attack.mitre.org/techniques/${sub.external_id.split('.')[0]}/${sub.external_id.split('.')[1]}/' target="_blank">• ${sub.name}</a> - Vis: ${(sub.visibility_ratio*100).toFixed(0)}%`
    ).join('\n')}`
    : 'No Subtechniques';

  const groups_string = props.technique.groups.length > 0 
    ? `Groups:\n`
    : "No Groups";

  let components_string = '';
  const visible_components = store.visibleAttributes('data_components');
  const total_components_detecting_technique = props.technique.data_components.length;
  let visible_components_count = 0;
  props.technique.data_components.forEach((component) => {
    if (visible_components.includes(component)) {
      visible_components_count += 1;
      components_string += `<br>- ${component}`;
    } 
  });
  components_string = `(${visible_components_count} of ${total_components_detecting_technique})` +
                        ((components_string.length > 0) ? ':' : '') + components_string;

  return `<a href='https://attack.mitre.org/techniques/${props.technique.external_id}/' target="_blank">${props.technique.name}</a> (${props.technique.external_id})

      Visibility: ${(props.technique.visibility_ratio*100).toFixed(0)}%

      <hr>
      ${subtechniques_string}
      
      <hr>
      Nr groups using: ${props.technique.occurrence_groups}
      Nr software using: ${props.technique.occurrence_software}
      Total occurrence: ${props.technique.occurrence_total}

      <hr>
      Components visible ${components_string}

      <hr>
      ${groups_string}
  `
};

// ${props.technique.name}<br>
// ID: <a href='https://attack.mitre.org/techniques/${props.technique.external_id}/' target="_blank">${props.technique.external_id}</a>

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

  // Filter techniques based on the Minimum Total Occurrence slider.
  let techniqueTotalOccurrencesFilterResult = (
    props.technique.occurrence_total >= store.minTotalOccurrences
  );

  // Filter techniques based on the Minimum Total Occurrence BINNED slider.
  let techniqueTotalOccurrencesFilterBinnedResult = false;
  // Minimum Total Occurrence: Low
  if (store.minTotalOccurrencesBinned <= 0) {
    techniqueTotalOccurrencesFilterBinnedResult = true;
  }
  // Minimum Total Occurrence: Medium
  if (store.minTotalOccurrencesBinned === 1) {
    techniqueTotalOccurrencesFilterBinnedResult = (props.technique.occurrence_total_order_normalized > 0.25)
  }
  // Minimum Total Occurrence: High
  if (store.minTotalOccurrencesBinned === 2) {
    techniqueTotalOccurrencesFilterBinnedResult = (props.technique.occurrence_total_order_normalized > 0.5)
  }
  // Minimum Total Occurrence: Very High
  if (store.minTotalOccurrencesBinned >= 3) {
  techniqueTotalOccurrencesFilterBinnedResult = (props.technique.occurrence_total_order_normalized > 0.75)
  }


  // When the group tool mask toggle (domain.only_show_selected_groups) is switch to 'true', we want to hide all techniques that are not covered by the selected groups.
  let groupMaskFilterResult = (
    !(domain.only_show_selected_groups && !store.selectedGroupsTechniquesSet.has(props.technique.name))
  );

  return platformFilterResult && techniqueVisibilityPercentageFilterResult && techniqueTotalOccurrencesFilterResult && techniqueTotalOccurrencesFilterBinnedResult && groupMaskFilterResult;
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
  outline: 3px solid rgb(57, 55, 139);  /* Change the border color on hover */
}

button.occurs-in-selected-groups {
  border: 2px solid rgb(255, 0, 0);  /* Change the border color on group select */
}

/* TODO: Change this so the box-shadow itself is always in front of other buttons (in terms of z-index). */
button.occurs-in-hovered-groups {
  /* transform: translate(1px, -2px);
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.7);
  outline: 3px solid rgb(57, 55, 139); */
  box-shadow: 0 0 8px 5px rgba(255, 174, 0, 1);
  /* text-shadow: 0px 0px 4px rgb(255, 0, 0); */
  z-index: 1001;
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
  width: 240px;
  text-align: left;
  white-space: pre-line;
}

</style>