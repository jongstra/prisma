<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '@/components/common/BarChart.vue';
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

interface Tactic {
  name: string;
  technique_count: number;
  subtechnique_count: number;
}

function getTechniqueCountPerTactic(): Tactic[] {
  const tactics = store.currentDomain?.tactics;

  // Check if tactics is defined and is an array
  if (!Array.isArray(tactics)) {
    return [];
  }

  return tactics.map((tactic) => ({
    name: tactic.name,
    technique_count: tactic.technique_count,
    subtechnique_count: tactic.subtechnique_count,
  }));
}

// The longest bar in this chart fills the box.
const maxCount = computed(() => Math.max(0, ...getTechniqueCountPerTactic().map((x) => x.technique_count + x.subtechnique_count)));

// Blue: techniques; light blue: sub-techniques.
const rows = computed(() => getTechniqueCountPerTactic().map((tactic) => ({
  name: tactic.name,
  segments: [{ value: tactic.technique_count, color: 'SteelBlue' }, { value: tactic.subtechnique_count, color: '#89AFCF' }],
  label: tactic.technique_count + tactic.subtechnique_count,
})));
</script>

<template>
  <BarChart :rows="rows" :max="maxCount">
    <template #title>
      Tactics - Number of (Sub)Techniques
    </template>
  </BarChart>
</template>
