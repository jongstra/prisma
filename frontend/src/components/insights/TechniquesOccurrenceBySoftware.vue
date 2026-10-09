<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '@/components/common/BarChart.vue';
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

function getTopTechniquesBySoftware() {
  const sortedTechniques = [...store.techniquesOccurrences].sort((a, b) => b.software_occurrence - a.software_occurrence);
  return sortedTechniques;
}

// The longest bar in this chart fills the box.
const maxCount = computed(() => Math.max(0, ...getTopTechniquesBySoftware().map((x) => x.software_occurrence)));

// Olive: the number of software that use the technique.
const rows = computed(() => getTopTechniquesBySoftware().slice(0, 15).map((technique) => ({
  name: technique.name,
  segments: [{ value: technique.software_occurrence, color: 'Olive' }],
  label: technique.software_occurrence,
})));
</script>

<template>
  <BarChart :rows="rows" :max="maxCount" wrap-long-names>
    <template #title>
      Techniques
      <span v-if="getTopTechniquesBySoftware().length >= 15"> (Top 15)</span>
      - Occurrence by Software
    </template>
  </BarChart>
</template>
