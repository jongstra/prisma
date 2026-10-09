<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '@/components/common/BarChart.vue';
import { magmaStore } from '@/stores/magma';
import { tacticsStore } from '@/stores/tactics';

const store = tacticsStore();
const magma = magmaStore();

function getDataSourceEffectiveness() {
  const useCases = magma.L3UseCases(store.domain);

  // Object to store the use case effectiveness values and keep a use case count, for each dataSource.
  const stats = {};

  useCases.forEach(useCase => {
    if (!stats[useCase.dataSource]) {
      stats[useCase.dataSource] = { sum: 0, count: 0 };
    }
    stats[useCase.dataSource].sum += Number(useCase.effectiveness);
    stats[useCase.dataSource].count += 1;
  });

  // Remove any 'undefined' entry from stats, if present.
  delete stats.undefined;

  // Calculate the mean for each dataSource
  Object.keys(stats).forEach(dataSource => {
    stats[dataSource].mean = stats[dataSource].sum / stats[dataSource].count;
  });

  // Sort the object by its mean values from low to high and convert back to an object.
  const sortedStats = Object.fromEntries(
    Object.entries(stats).sort(([, a], [, b]) => a.mean - b.mean)
  );

  return sortedStats
}

// One bar per data source, the 15 with the lowest mean, with the mean and the number of use cases.
const rows = computed(() => Object.entries(getDataSourceEffectiveness()).slice(0, 15).map(([name, stats]: [string, any]) => (
  { name, segments: [{ value: stats.mean, color: 'blue' }], label: `${(stats.mean ?? 0).toFixed(2)}% (${stats.count} UC)` }
)));
</script>

<template>
  <BarChart :rows="rows" :max="100" label-space="100px" :name-width="100" label="inside-wide">
    <template #title>
      Data Sources - Mean Effectiveness
      <span v-if="Object.keys(getDataSourceEffectiveness()).length >= 15"> (Top 15 Worst)</span>
    </template>
  </BarChart>
</template>
