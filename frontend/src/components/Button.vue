<script setup lang="ts">

  import { computed } from 'vue';
  import { tacticsStore } from '@/stores/tactics';
  const store = tacticsStore()

  // defineProps(['technique']);
  const props = defineProps(['technique']);

  const getHoverText = () => {

  // Determine the groups string
  const groups_string = props.technique.groups.length > 0 
    ? `Groups:\n${props.technique.groups.map(group => `- ${group}`).join('\n')}`
    : "No Groups";

  if (!props.technique.sub_techniques) {
    return `Technique ID: ${props.technique.external_id}\n\nNo Subtechniques\n\n${groups_string}\n\nCampaign occurrence: ${props.technique.occurrence}`;
  } else {
    // Concatenate names and external IDs of subtechniques.
    const subtechniques_string = props.technique.sub_techniques.map(sub => `- ${sub.name}`).join('\n');

    return `Technique ID: ${props.technique.external_id}\n\nSubtechniques:\n${subtechniques_string}\n\n${groups_string}\n\nCampaign occurrence: ${props.technique.occurrence}`;
  }
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

  const toggleVisibility = () => {
    store.toggleTechniqueVisiblity(props.technique);
  }

  // Computed property to determine if the button should be shown.
  const showButton = computed(() => {
    const platforms = props.technique?.platforms || [];

    // Filter techniques based on the selected platforms in the Platforms filter.
    // Also filter techniques based on the searchQuery string in the search bar (if not empty).
    if (
          (platforms.some(platform => store.activeAttributes('platforms').includes(platform))) && 
          (!store.searchQuery || props.technique.name.toLowerCase().includes(store.searchQuery.toLowerCase()))
       ) {
      return true;
    }
    else {
      return false;
    }
    
  });

</script>


 <template>
  <button v-if="showButton"
    :style="getButtonStyles(technique.visibility_ratio)"
    :data-title="getHoverText()"
  >
    <span class="buttontext">{{ technique.name }}</span>
  </button>
</template>


<style scoped>

button {
  margin-top: 0;
  margin-bottom: 0;
  background-color: rgb(246, 246, 246);
  border: 1.5px solid rgb(42, 42, 42);
  border-radius: 4px; /* Slightly rounded corners */
  transition: transform 0.2s ease, box-shadow 0.2s ease; /* Smooth transition for transform and shadow */
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
button:hover {
  transform: translateY(-1px); /* Slight upward movement on hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.7); /* Add a shadow */
  border: solid red;
  background-color: rgb(215, 215, 215); /* Slightly lighter background on hover */
  z-index: 1000; /* Bring the button and tooltip to the front on hover */
}

/* Tooltip styling */
button[data-title] {
  position: relative;
}

button[data-title]:hover::after {
  content: attr(data-title); /* Use data-title instead of title */
  position: absolute;
  left: calc(50% + 10px);
  transform: translateX(-50%);
  top: 140%; /* Position tooltip below the button */
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
  transition: opacity 0.1s ease;
  width: 145px;
  text-align: left;
}


/* Make the tooltip initially hidden */
/* button[data-title]::after,
button[data-title]::before {
  opacity: 0;
  visibility: hidden;
} */

</style>