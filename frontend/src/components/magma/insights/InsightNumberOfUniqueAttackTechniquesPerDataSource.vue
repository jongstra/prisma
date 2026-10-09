<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '@/components/common/BarChart.vue';
import { magmaStore } from '@/stores/magma';
import { tacticsStore } from '@/stores/tactics';

const store = tacticsStore();
const magma = magmaStore();


function getAttackTechniquesPerDataSource() {
  const useCases = magma.L3UseCases(store.domain);

  // Initialize frequencyDict as an object where each key is a dataSource and the value is a Set of attackTechniqueIds.
  const frequencyDict: Record<string, Set<string>> = {};
  useCases.forEach(useCase => {
    const dataSource = useCase.dataSource;
    if (!frequencyDict[dataSource]) {
      frequencyDict[dataSource] = new Set(); // Initialize as a set if not already present.
    }
    frequencyDict[dataSource].add(useCase.attackTechniqueId); // Add techniqueId to the set.
  });

  // Remove any 'undefined' entry from frequencyDict, if present.
  delete frequencyDict.undefined;

  // Sort the frequencyDict by the size of each Set (number of items) in descending order.
  const sortedFrequencyDict = Object.fromEntries(
    Object.entries(frequencyDict).sort(([, a], [, b]) => {
      // Compare the sizes of the Sets in descending order.
      return b.size - a.size;
    })
  );

  return sortedFrequencyDict;
}




// The longest bar in this chart fills the box.
const maxCount = computed(() => Math.max(0, ...Object.values(getAttackTechniquesPerDataSource()).map((x) => x.size)));

// One red bar per item, the top 15.
const rows = computed(() => Object.entries(getAttackTechniquesPerDataSource()).slice(0, 15).map(([name, techniques]) => (
  { name, segments: [{ value: techniques.size ?? 0, color: 'red' }], label: techniques.size ?? 0 }
)));
</script>

<template>
  <BarChart :rows="rows" :max="maxCount" :name-width="100" label="inside">
    <template #title>
      Number of Unique Attack Techniques per Data Source
      <span v-if="Object.keys(getAttackTechniquesPerDataSource()).length >= 15"> (Top 15)</span>
    </template>
  </BarChart>
</template>
