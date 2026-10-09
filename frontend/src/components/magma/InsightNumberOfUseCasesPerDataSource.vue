<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '@/components/common/BarChart.vue';
import { magmaStore } from '@/stores/magma';
import { tacticsStore } from '@/stores/tactics';

const store = tacticsStore();
const magma = magmaStore();


function getMostFrequentDataSources() {
  const useCases = magma.L3UseCases(store.domain);

  const frequencyDict: Record<string, number> = {};
  useCases.forEach(useCase => {
    frequencyDict[useCase.dataSource] = (frequencyDict[useCase.dataSource] || 0) + 1;
  })

  // Remove the 'undefined' entry.
  delete frequencyDict.undefined;

  // Sort the frequencyDict by values from high to low and convert back to an object.
  const sortedFrequencyDict = Object.fromEntries(Object.entries(frequencyDict).sort(([, a], [, b]) => b - a));
  return sortedFrequencyDict
}



// The longest bar in this chart fills the box.
const maxCount = computed(() => Math.max(0, ...Object.values(getMostFrequentDataSources())));

// One red bar per item, the top 15.
const rows = computed(() => Object.entries(getMostFrequentDataSources()).slice(0, 15).map(([name, frequency]) => (
  { name, segments: [{ value: frequency ?? 0, color: 'red' }], label: frequency ?? 0 }
)));
</script>

<template>
  <BarChart :rows="rows" :max="maxCount" :name-width="100" label="inside">
    <template #title>
      Number of Use Cases per Data Source
      <span v-if="Object.keys(getMostFrequentDataSources()).length >= 15"> (Top 15)</span>
    </template>
  </BarChart>
</template>
