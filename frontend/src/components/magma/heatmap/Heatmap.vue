<script setup lang="ts">
import { tacticsStore } from '@/stores/tactics';
import HeatmapButtonColumn from './HeatmapButtonColumn.vue';
import HeatmapStyleCheckboxes from './HeatmapStyleCheckboxes.vue';
import HeatmapSliderFilter from './HeatmapSliderFilter.vue';
import HeatmapSearchBar from './HeatmapSearchBar.vue';
import SelectionTool from '@/components/common/SelectionTool.vue';
const store = tacticsStore();

// The matrix columns are keyed by domain and tactic, so switching domains creates new columns: each column and
// technique button keeps the domain it was created for.
</script>


<template>

<div>
  <div class="heatmap-settings">
    <HeatmapStyleCheckboxes/>
    <HeatmapSliderFilter/>
    <SelectionTool class="heatmap-selection" list="groups" selected-field="selectedInMagmaHeatmap"
      only-show-field="only_show_selected_groups_magma_heatmap" noun="group"
      toggle-title="Only show techniques used by selected groups." color="red"/>
    <HeatmapSearchBar/>
  </div>
  <div class="heatmap-container">
    <div class="heatmap">
      <div v-for="tactic in store.currentDomain?.tactics" :key="`${store.domain}|${tactic.name}`" class="button-columns">
        <HeatmapButtonColumn :tactic=tactic :techniques=tactic.techniques />
      </div>
    </div>
  </div>
</div>

</template>


<style scoped>
.heatmap-selection {
  margin: 0px 5px;
}


div.heatmap-settings {
  display: flex;
  direction: row;
  justify-content: start;
  margin-top: 3px;
  margin-bottom: 2px;
}

.heatmap-container {
  overflow-x: auto; /* Enable horizontal scrollbar */
  width: 100%; /* Full width of the parent container */
  transform: rotateX(180deg);  /* Rotates container upside down so the horizontal scrollbar is at the top. */
}

.heatmap {
  display: flex;
  width: fit-content; /* Allow content to take up natural width */
  transform: rotateX(180deg); /* Rotates the matrix content upside down AGAIN (after doing this to the .matrix-container), so it rotated back to normal. */
}

.button-columns {
  flex: 1; /* Allow components to grow and take up available space */
  width: auto; /* Allow components to take their natural width */
  margin-right: 4px; /* Adjust spacing between components */
}

</style>