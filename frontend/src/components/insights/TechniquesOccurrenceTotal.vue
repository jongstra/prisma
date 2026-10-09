<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '@/components/common/BarChart.vue';
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

function getTopTechniques() {
  const sortedTechniques = [...store.techniquesOccurrences].sort((a, b) => b.total_occurrence - a.total_occurrence);
  return sortedTechniques;
}

// The longest bar in this chart fills the box.
const maxCount = computed(() => Math.max(0, ...getTopTechniques().map((x) => x.total_occurrence)));

// Red: groups; olive: software.
const rows = computed(() => getTopTechniques().slice(0, 15).map((technique) => ({
  name: technique.name,
  segments: [{ value: technique.group_occurrence, color: 'FireBrick' }, { value: technique.software_occurrence, color: 'Olive' }],
  label: technique.total_occurrence,
})));
</script>

<template>
  <BarChart :rows="rows" :max="maxCount" wrap-long-names>
    <template #title>
      Techniques
      <span v-if="getTopTechniques().length >= 15"> (Top 15)</span>
      - Total Occurrence
    </template>
  </BarChart>
</template>
