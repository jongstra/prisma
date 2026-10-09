<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '@/components/common/BarChart.vue';
import { potentialSegments } from './potentialSegments';

const props = defineProps(['L1UseCase', 'relatedL3UseCases']);

// The 15 L3 use cases below this L1 use case with the most improvement potential.
const rows = computed(() => [...props.relatedL3UseCases].sort((a, b) => (b.potential ?? 100) - (a.potential ?? 100)).slice(0, 15).map((useCase) => (
  { name: useCase.id, segments: potentialSegments(useCase), label: `${(useCase.potential ?? 100).toFixed(2)}%` }
)));
</script>

<template>
  <BarChart class="full-height" :rows="rows" :max="100" label-space="0px" :name-width="100" label="end">
    <template #title>
      Improvement Potential for L3 Use Cases relating to:
      <br>
      <span style="color: red;">[L1] {{ L1UseCase.id }}: {{ L1UseCase.name }}</span>
      <span v-if="relatedL3UseCases.length >= 15"> (Top 15)</span>
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
/* The chart takes the height of its row on the Insights tab (minus its top margin), so charts in the same row are equally high. */
.full-height {
  height: calc(100% - 10px);
}

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
  margin-top: 5px;
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
}
</style>
