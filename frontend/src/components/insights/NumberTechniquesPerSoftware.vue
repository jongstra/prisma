<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '@/components/common/BarChart.vue';
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

interface Software {
  name: string;
  technique_count: number;
  subtechnique_count: number;
}

function getTechniqueCountPerSoftware(): Software[] {
  const softwares = store.currentDomain?.softwares;

  // Check if softwares is defined and is an array
  if (!Array.isArray(softwares)) {
    return [];
  }

  // Return the top 15 softwares (they are pre-sorted in Python on all_technique_count). Remove any softwares with a 0 all_technique_count.
  return softwares
    .filter((software) => software.all_technique_count > 0)
    .slice(0, 15)
    .map((software) => ({
      name: software.name,
      technique_count: software.technique_count,
      subtechnique_count: software.subtechnique_count,
    }));
}

// The longest bar in this chart fills the box.
const maxCount = computed(() => Math.max(0, ...getTechniqueCountPerSoftware().map((x) => x.technique_count + x.subtechnique_count)));

// Blue: techniques; light blue: sub-techniques.
const rows = computed(() => getTechniqueCountPerSoftware().map((software) => ({
  name: software.name,
  segments: [{ value: software.technique_count, color: 'SteelBlue' }, { value: software.subtechnique_count, color: '#89AFCF' }],
  label: software.technique_count + software.subtechnique_count,
})));
</script>

<template>
  <BarChart :rows="rows" :max="maxCount">
    <template #title>
      Software
      <span v-if="getTechniqueCountPerSoftware().length >= 15"> (Top 15)</span>
      - Number (Sub)Techniques
    </template>
  </BarChart>
</template>
