<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '@/components/common/BarChart.vue';
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

// A suggested data component, as shown in the chart.
interface Component {
  name: string;
  technique_count: number;
  subtechnique_count: number;
  coverage: string;
}

function getTopCoverageComponents(): Component[] {
  const components = store.currentDomain?.data_components;

  // Check if components is defined and is an array
  if (!Array.isArray(components)) {
    return [];
  }

  // Return the top 15 components (that are not used yet), which increase (sub)technique visibility the most. 
  return components
    .filter((component) => component.visibility == true)
    .filter((component) => component.quality.device_completeness < 5)
    .filter((component) => component.all_technique_count > 0)
    .slice(0, 15)
    .map((component) => ({
      name: component.name,
      technique_count: component.technique_count,
      subtechnique_count: component.subtechnique_count,
      coverage: (component.quality.device_completeness * 0.2 * 100).toFixed(0),
    }));
}


// The longest bar in this chart fills the box.
const maxCount = computed(() => Math.max(0, ...getTopCoverageComponents().map((x) => x.technique_count + x.subtechnique_count)));

// Blue: techniques; light blue: sub-techniques.
const rows = computed(() => getTopCoverageComponents().map((component) => ({
  name: component.name,
  segments: [{ value: component.technique_count, color: 'SteelBlue' }, { value: component.subtechnique_count, color: '#89AFCF' }],
  label: component.technique_count + component.subtechnique_count,
})));
</script>

<template>
  <BarChart :rows="rows" :max="maxCount" wrap-long-names>
    <template #title>
      Suggestion: Improve Coverage of Exisiting Components
      <span v-if="getTopCoverageComponents().length >= 15"> (Top 15)</span>
    </template>
    <template #name="{ row, index }">{{ row.name }} <br/> [Current Coverage: {{ getTopCoverageComponents()[index].coverage }}%]</template>
  </BarChart>
</template>
