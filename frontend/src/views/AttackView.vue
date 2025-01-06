<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import ButtonColumn from '../components/attack/ButtonColumn.vue';
import { tacticsStore } from '@/stores/tactics';
import FileUploadButtonYaml from '@/components/attack/FileUploadButtonYaml.vue';
import TechniqueAttributeFilter from '@/components/attack/TechniqueAttributeFilter.vue';
import TechniqueVisibilityPercentageFilter from '@/components/attack/TechniqueVisibilityPercentageFilter.vue';
// import TechniqueTotalOccurrenceFilter from '@/components/TechniqueTotalOccurrenceFilter.vue';
import TechniqueTotalOccurrenceFilterBinned from '@/components/attack/TechniqueTotalOccurrenceFilterBinned.vue';
import VisibilityLegend from '@/components/attack/VisibilityLegend.vue';
import SearchBar from '@/components/attack/SearchBar.vue';
import GroupSelectionTool from '@/components/attack/GroupSelectionTool.vue';
import ComponentSelectionTool from '@/components/attack/ComponentSelectionTool.vue';
const store = tacticsStore();

// When the domain is changed, we want to unpin any pinned tooltips for cleanliness,
// and clear the technique filter search box text.
watch(() => store.domain, () => {
  store.pinnedTooltipId = '';
  store.searchQuery = '';
});

// Handle keydown event to unpin tooltips on escape
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' || event.key === 'Esc') {
    store.pinnedTooltipId = '';
  }
};

// Add event listener on component mount
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

// Remove event listener on component unmount
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class='combined-controls'>
    
    <!-- Row 1 -->
    <div class="controls-row">
      <div class='upload-button'><FileUploadButtonYaml/></div>
      <div class='filter'><TechniqueTotalOccurrenceFilterBinned/></div>
      <div class='filter'><TechniqueVisibilityPercentageFilter/></div>
      <div class='legend'><VisibilityLegend/></div>
    </div>

    <!-- Horizontal bar -->
    <div class="horizontal-bar"></div>

    <!-- Row 2 -->
    <div class="controls-row">
      <div class='filter'><TechniqueAttributeFilter attribute_type="platforms"/></div>
      <div class='search'><SearchBar/></div>
      <div class='group-selection-tool'><GroupSelectionTool/></div>
      <div class='component-selection-tool'><ComponentSelectionTool/></div>
    </div>

  </div>

  <div class="matrix-container">
    <div class='attack-matrix'>
      <div v-if="store.domain === 'enterprise-attack'" v-for="tactic in store.enterprise.tactics" class="button-columns">
        <ButtonColumn :tactic=tactic :techniques=tactic.techniques />
      </div>

      <div v-else-if="store.domain === 'mobile-attack'" v-for="tactic in store.mobile.tactics" class="button-columns">
        <ButtonColumn :tactic=tactic :techniques=tactic.techniques />
      </div>

      <div v-else-if="store.domain === 'ics-attack'" v-for="tactic in store.ics.tactics" class="button-columns">
        <ButtonColumn :tactic=tactic :techniques=tactic.techniques />
      </div>
    </div>
  </div>
</template>



# TODO: Controls herschikken mbv Gridbox ipv flexbox? Zie: https://gridbyexample.com/examples/


<style scoped>
.combined-controls {
  display: flex;
  flex-direction: column; /* Arrange items in a column */
  background-color: #ccc;
  margin-top: 0px;
  margin-bottom: 3px;
  border: 2px solid black;
  border-radius: 5px;
  max-width: 900px;
  height: auto; /* Ensure the container has a defined height */
}

.controls-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between; /* This aligns items horizontally */
  align-items: center; /* This vertically centers the items */
  flex-wrap: wrap; /* Allows items to wrap onto multiple lines if needed */
}

.horizontal-bar {
  width: 100%;
  height: 2px;
  background-color: black;
  margin: 0px 0; /* Adds vertical spacing around the bar */
}

.filter, .search, .upload-button, .legend, .group-selection-tool, .component-selection-tool {
  flex: 1; /* Allows the items to grow and fill space */
  display: flex;
  margin: 3px; /* Add some spacing between items */
}

.matrix-container {
  overflow-x: auto; /* Enable horizontal scrollbar */
  width: 100%; /* Full width of the parent container */
  transform: rotateX(180deg);  /* Rotates container upside down so the horizontal scrollbar is at the top. */
}

.attack-matrix {
  display: flex;
  width: fit-content; /* Allow content to take up natural width */
  transform: rotateX(180deg); /* Rotates the matrix content upside down AGAIN (after doing this to the .matrix-container), so it rotated back to normal. */
}

.button-columns {
  flex: 1; /* Allow components to grow and take up available space */
  width: auto; /* Allow components to take their natural width */
  margin-right: 4px; /* Adjust spacing between components */
  margin-bottom: 3000px; /* Forces a bottom margin to create space for the Tooltip when hovering Technique Buttons. */
}
</style>
