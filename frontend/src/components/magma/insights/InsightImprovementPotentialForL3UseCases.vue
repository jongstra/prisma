<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '@/components/common/BarChart.vue';
import { potentialSegments } from './potentialSegments';
import { magmaStore } from '@/stores/magma';
import { tacticsStore } from '@/stores/tactics';

const store = tacticsStore();
const magma = magmaStore();


function getHighestPotentialL3UseCases() {
  const useCases = magma.L3UseCases(store.domain);

  // Sort use cases on their potential in descending order.
  useCases.sort((a, b) => (b.potential??100) - (a.potential??100));

  return useCases
}

// The 15 L3 use cases with the most improvement potential.
const rows = computed(() => getHighestPotentialL3UseCases().slice(0, 15).map((useCase) => (
  { name: useCase.id, segments: potentialSegments(useCase), label: `${(useCase.potential ?? 100).toFixed(2)}%` }
)));
</script>

<template>
  <BarChart :rows="rows" :max="100" label-space="0px" :name-width="100" label="end">
    <template #title>
      Improvement Potential for L3 Use Cases
      <span v-if="getHighestPotentialL3UseCases().length >= 15"> (Top 15)</span>
    </template>
    <template #legend>
      <div class="legend">
        <div class="legend-item">
          <div class="sub-bar red"></div>
          <span>Visibility Potential</span>
        </div>
        <div class="legend-item">
          <div class="sub-bar green"></div>
          <span>Implementation Potential</span>
        </div>
        <div class="legend-item">
          <div class="sub-bar blue"></div>
          <span>Effectiveness Potential</span>
        </div>
      </div>
    </template>
  </BarChart>
</template>

<style scoped>
.sub-bar {
  height: 14px;
  position: relative;
}

.red {
  background-color: red;
}

.green {
  background-color: green;
}

.blue {
  background-color: blue;
}

.legend {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  margin-top: 5px; /* Add some spacing above the legend */
  margin-bottom: 5px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px; /* Space between the bar and label */
  font-size: 11px;
}

.legend-item .sub-bar {
  width: 20px; /* Fixed size for legend bars */
  height: 14px;
}
</style>
