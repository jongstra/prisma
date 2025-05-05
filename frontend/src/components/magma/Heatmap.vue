<script setup lang="ts">
import { tacticsStore } from '@/stores/tactics';
import HeatmapButtonColumn from './HeatmapButtonColumn.vue';
import HeatmapStyleCheckboxes from './HeatmapStyleCheckboxes.vue';
import HeamapSliderFilter from './HeamapSliderFilter.vue';
const store = tacticsStore();
</script>


<template>

<div>
  <div class="heatmap-settings">
    <HeatmapStyleCheckboxes/>
    <HeamapSliderFilter/>
  </div>
  <div class="heatmap-container">
    <div class="heatmap">
      <div v-if="store.domain === 'enterprise-attack'" v-for="tactic in store.enterprise.tactics" class="button-columns">
        <HeatmapButtonColumn :tactic=tactic :techniques=tactic.techniques />
      </div>

      <div v-else-if="store.domain === 'mobile-attack'" v-for="tactic in store.mobile.tactics" class="button-columns">
        <HeatmapButtonColumn :tactic=tactic :techniques=tactic.techniques />
      </div>

      <div v-else-if="store.domain === 'ics-attack'" v-for="tactic in store.ics.tactics" class="button-columns">
        <HeatmapButtonColumn :tactic=tactic :techniques=tactic.techniques />
      </div>
    </div>
  </div>
</div>

</template>


<style scoped>

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
  margin-bottom: 3000px; /* Forces a bottom margin to create space for the Tooltip when hovering Technique Buttons. */
}

</style>