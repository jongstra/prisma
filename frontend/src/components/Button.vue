<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { tacticsStore } from '@/stores/tactics';
import { v4 as uuidv4 } from 'uuid';

const store = tacticsStore();
const props = defineProps(['technique']);
const id = uuidv4();

let showTooltip = ref(false);

// Watch for changes in store.pinnedTooltipId
watch(() => store.pinnedTooltipId, (newPinnedTooltipId) => {
  if (newPinnedTooltipId !== id) {
    showTooltip.value = false;
  }
});

const toggleTooltipPinning = () => {
  if (store.pinnedTooltipId === id) {
    store.unpinToolTip();
  } else {
    store.pinToolTip(id);
  }
};

const showTooltipOnHover = () => {
  if (store.pinnedTooltipId === '') {
    showTooltip.value = true;
  }
};

const hideTooltipOnLeave = () => {
  if (store.pinnedTooltipId === '') {
    showTooltip.value = false;
  }
};


const getCheckboxHtml = (groups: string[]) => {
  return groups.map(group => `
    <label for="${group}-${id}" style="display: inline-flex; align-items: center; margin-right: 10px;">
      <input type="checkbox" id="${group}-${id}" name="${group}" style="margin-right: 5px;">
      <span class="group-name">${group}</span>
    </label>
  `).join('');
};

const getTooltipText = () => {
  const subtechniques_string = props.technique.sub_techniques 
    ? `Subtechniques:\n${props.technique.sub_techniques.map(sub => `- ${sub.name}`).join('\n')}`
    : 'No Subtechniques';

  const groups_string = props.technique.groups.length > 0 
    ? `Groups:<br>${getCheckboxHtml(props.technique.groups)}`
    : "No Groups";

  let components_string = '';
  const visible_components = store.visibleAttributes('data_components');
  const total_components_detecting_technique = props.technique.data_components.length;
  let visible_components_detecting_technique = 0;
  props.technique.data_components.forEach((component) => {
    if (visible_components.includes(component)) {
      visible_components_detecting_technique += 1;
      components_string += `- ${component}<br>`;
    } 
  });
  components_string = `${visible_components_detecting_technique} of ${total_components_detecting_technique} components visible` +
                        ((components_string.length > 0) ? ':' : '.') + `<br>` + components_string;

  return `
      Technique ID: ${props.technique.external_id}<br>
      ${subtechniques_string}<br>
      ${groups_string}
      <div>Nr groups using this: ${props.technique.occurrence_groups}</div>
      <div>Nr software using this: ${props.technique.occurrence_software}</div>
      <div>Total occurrence: ${props.technique.occurrence_total}</div>
      <div>${components_string}</div>
  `;
};

function getButtonStyles(visibility_ratio: number): { backgroundColor: string, color: string } {
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

</script>


<template>
  <button v-if="showButton"
    :style="getButtonStyles(technique.visibility_ratio)"
    :class="{'pin-tooltip': store.pinnedTooltipId === id}"
    @click="toggleTooltipPinning"
    @mouseover="showTooltipOnHover"
    @mouseleave="hideTooltipOnLeave"
  >
    <span class="buttontext">{{ technique.name }}</span>
    <div v-if="showTooltip || store.pinnedTooltipId === id" class="tooltip" v-html="getTooltipText()" @click.stop>
    </div>
  </button>
</template>


<style scoped>
button {
  margin-top: 0px;
  margin-bottom: 0px;
  background-color: rgb(246, 246, 246);
  border: 1.5px solid rgb(42, 42, 42);
  border-radius: 4px; /* Slightly rounded corners */
  transition: transform 0.1s ease, box-shadow 0.1s ease; /* Smooth transition for transform and shadow */
  position: relative; /* Ensure the button's stacking context is isolated */
  z-index: 1; /* Set a base z-index */
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

/* Hover effect */
button:hover,
button.pin-tooltip {
  transform: translate(1px, -2px); /* Move button slightly to the right and upwards on hover */
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.7); /* Add a shadow */
  border: 1.5px solid red;  /* Change the border color to red on hover */
  filter: brightness(0.88); /* Slightly darken the button on hover */
  z-index: 1000; /* Bring the button and tooltip to the front on hover */
}

.tooltip {
  position: absolute;
  left: calc(50% + 15px);
  transform: translateX(-50%);
  top: 180%; /* Position tooltip below the button */
  background-color: rgba(93, 125, 152, 0.9);
  color: white;
  border: 1px solid black;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: pre-line; /* Preserve line breaks in tooltip */
  z-index: 1001; /* Ensure tooltip is in front of other elements */
  width: 145px;
  text-align: left;
}

</style>




<!-- <script setup lang="ts">

  import { computed, ref } from 'vue';
  import { tacticsStore } from '@/stores/tactics';
  import { v4 as uuidv4 } from 'uuid';
  const store = tacticsStore()
  const props = defineProps(['technique']);
  const id = uuidv4();


  let pinTooltip = ref(false)
  const toggleTooltipPinning = () => {
    pinTooltip.value = !pinTooltip.value;
  }
  

  const getTooltipText = () => {
    
    // Create the subtechniques string
    const subtechniques_string = props.technique.sub_techniques 
      ? `Subtechniques:\n${props.technique.sub_techniques.map(sub => `- ${sub.name}`).join('\n')}`
      : 'No Subtechniques';

    // Create the groups string
    const groups_string = props.technique.groups.length > 0 
      ? `Groups:\n${props.technique.groups.map(group => `- [ ] ${group}`).join('\n')}`
      : "No Groups";

    // Create the components string
    let components_string = '';
    const visible_components = store.visibleAttributes('data_components');
    const total_components_detecting_technique = props.technique.data_components.length;
    let visible_components_detecting_technique = 0;
    props.technique.data_components.forEach((component) => {
      if (visible_components.includes(component)) {
        visible_components_detecting_technique+=1;
        components_string += `- ${component}\n`
      } 
    });
    components_string = `${visible_components_detecting_technique} of ${total_components_detecting_technique} components visible` +
                          ((components_string.length>0) ? ':' : '.') + `\n` + components_string;

    return `Technique ID: ${props.technique.external_id}\n\n${subtechniques_string}\n\n${groups_string}
            \nNr groups using this: ${props.technique.occurrence_groups}
            Nr software using this: ${props.technique.occurrence_software}
            Total occurrence: ${props.technique.occurrence_total}
            \n${components_string}`;
  };


  function getButtonStyles(visibility_ratio: number): { backgroundColor: string, color: string } {
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

  // Computed property to determine if the button should be shown.
  const showButton = computed(() => {
    const platforms = props.technique?.platforms || [];

    // Filter techniques based on the selected platforms in the Platforms filter.
    // Also filter techniques based on the searchQuery string in the search bar (if not empty).
    let platformFilterResult = (
      (platforms.some(platform => store.activeAttributes('platforms').includes(platform))) && 
      (!store.searchQuery || props.technique.name.toLowerCase().includes(store.searchQuery.toLowerCase()))
    )

    let techniqueVisibilityPercentageFilterResult = (
      (props.technique.visibility_ratio >= store.minVisibilityRatio) &&
      (props.technique.visibility_ratio <= store.maxVisibilityRatio)
    )

    let techniqueTotalOccurrencesFilterResult = (
      props.technique.occurrence_total >= store.minTotalOccurrences
    )


    if (platformFilterResult && techniqueVisibilityPercentageFilterResult && techniqueTotalOccurrencesFilterResult) {
      return true
    } else {
      return false
    }
    
  });

</script>


<template>
  <button v-if="showButton"
    :style="getButtonStyles(technique.visibility_ratio)"
    :data-tooltip=getTooltipText()
    :class="{'pin-tooltip': pinTooltip}"
    @click="toggleTooltipPinning"
  >
    <span class="buttontext">{{ technique.name }}</span>
  </button>
</template>


<style scoped>

button {
  margin-top: 0px;
  margin-bottom: 0px;
  background-color: rgb(246, 246, 246);
  border: 1.5px solid rgb(42, 42, 42);
  border-radius: 4px; /* Slightly rounded corners */
  transition: transform 0.1s ease, box-shadow 0.1s ease; /* Smooth transition for transform and shadow */
  position: relative; /* Ensure the button's stacking context is isolated */
  z-index: 1; /* Set a base z-index */
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

/* Hover effect */
button:hover,
button.pin-tooltip {
  transform: translate(1px, -2px); /* Move button slightly to the right and upwards on hover */
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.7); /* Add a shadow */
  border: 1.5px solid red;  /* Change the border color to red on hover */
  filter: brightness(0.88); /* Slightly darken the button on hover */
  z-index: 1000; /* Bring the button and tooltip to the front on hover */
}

/* Tooltip styling */
button[data-tooltip] {
  position: relative;
}

/* Define tooltip content */
button[data-tooltip]:hover::after,
button.pin-tooltip::after {
  content: attr(data-tooltip); /* Use data-tooltip instead of title */
  position: absolute;
  left: calc(50% + 10px);
  transform: translateX(-50%);
  top: 180%; /* Position tooltip below the button */
  background-color: rgba(93, 125, 152, 0.9);
  color: white;
  border: 1px solid black;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: pre-line; /* Preserve line breaks in tooltip */
  z-index: 1001; /* Ensure tooltip is in front of other elements */
  opacity: 1;
  visibility: visible;
  transition: opacity 0.2s ease;
  width: 145px;
  text-align: left;
}

</style> -->
