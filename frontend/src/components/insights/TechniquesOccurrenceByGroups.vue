<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '@/components/common/BarChart.vue';
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

function getTopTechniquesByGroup() {
  const sortedTechniques = [...store.techniquesOccurrences].sort((a, b) => b.group_occurrence - a.group_occurrence);
  return sortedTechniques;
}

// The longest bar in this chart fills the box.
const maxCount = computed(() => Math.max(0, ...getTopTechniquesByGroup().map((x) => x.group_occurrence)));

// Red: the number of groups that use the technique.
const rows = computed(() => getTopTechniquesByGroup().slice(0, 15).map((technique) => ({
  name: technique.name,
  segments: [{ value: technique.group_occurrence, color: 'FireBrick' }],
  label: technique.group_occurrence,
})));
</script>

<template>
  <BarChart :rows="rows" :max="maxCount" wrap-long-names>
    <template #title>
      Techniques
      <span v-if="getTopTechniquesByGroup().length >= 15"> (Top 15)</span>
      - Occurrence by Groups
    </template>
  </BarChart>
</template>
