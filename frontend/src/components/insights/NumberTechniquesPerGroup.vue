<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '@/components/common/BarChart.vue';
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

interface Group {
  name: string;
  technique_count: number;
  subtechnique_count: number;
}

function getTechniqueCountPerGroup(): Group[] {
  const groups = store.currentDomain?.groups;

  // Check if groups is defined and is an array
  if (!Array.isArray(groups)) {
    return [];
  }

  // Return the top 15 groups (they are pre-sorted in Python on all_technique_count). Remove any groups with a 0 all_technique_count.
  return groups
    .filter((group) => group.all_technique_count > 0)
    .slice(0, 15)
    .map((group) => ({
      name: group.name,
      technique_count: group.technique_count,
      subtechnique_count: group.subtechnique_count,
    }));
}

// The longest bar in this chart fills the box.
const maxCount = computed(() => Math.max(0, ...getTechniqueCountPerGroup().map((x) => x.technique_count + x.subtechnique_count)));

// Blue: techniques; light blue: sub-techniques.
const rows = computed(() => getTechniqueCountPerGroup().map((group) => ({
  name: group.name,
  segments: [{ value: group.technique_count, color: 'SteelBlue' }, { value: group.subtechnique_count, color: '#89AFCF' }],
  label: group.technique_count + group.subtechnique_count,
})));
</script>

<template>
  <BarChart :rows="rows" :max="maxCount">
    <template #title>
      Groups
      <span v-if="getTechniqueCountPerGroup().length >= 15"> (Top 15)</span>
      - Number (Sub)Techniques
    </template>
  </BarChart>
</template>
