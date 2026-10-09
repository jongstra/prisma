<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '@/components/common/BarChart.vue';
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

interface Platform {
  name: string;
  technique_count: number;
  subtechnique_count: number; // Added this field
}

function getTechniqueCountPerPlatform(): Platform[] {
  const platforms = store.currentDomain?.platforms;

  // Check if platforms is defined and is an array
  if (!Array.isArray(platforms)) {
    return [];
  }

  // Ensure each platform has a subtechnique_count
  return platforms.map((platform) => ({
    name: platform.name,
    technique_count: platform.technique_count,
    subtechnique_count: platform.subtechnique_count ?? 0,
  }));
}

// The longest bar in this chart fills the box.
const maxCount = computed(() => Math.max(0, ...getTechniqueCountPerPlatform().map((x) => x.technique_count + x.subtechnique_count)));

// Blue: techniques; light blue: sub-techniques.
const rows = computed(() => getTechniqueCountPerPlatform().map((platform) => ({
  name: platform.name,
  segments: [{ value: platform.technique_count, color: 'SteelBlue' }, { value: platform.subtechnique_count, color: '#89AFCF' }],
  label: platform.technique_count + platform.subtechnique_count,
})));
</script>

<template>
  <BarChart :rows="rows" :max="maxCount">
    <template #title>
      Platforms - Number of (Sub)Techniques
    </template>
  </BarChart>
</template>
