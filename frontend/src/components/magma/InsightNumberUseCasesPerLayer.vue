<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '@/components/common/BarChart.vue';
import { magmaStore } from '@/stores/magma';
import { tacticsStore } from '@/stores/tactics';

const store = tacticsStore();
const magma = magmaStore();

// The longest bar in this chart fills the box.
const maxCount = computed(() => Math.max(0, magma.L1UseCases(store.domain).length, magma.L2UseCases(store.domain).length, magma.L3UseCases(store.domain).length));

// One green bar per level.
const rows = computed(() => ([
  ['L1', magma.L1UseCases(store.domain).length],
  ['L2', magma.L2UseCases(store.domain).length],
  ['L3', magma.L3UseCases(store.domain).length],
] as [string, number][]).map(([name, count]) => ({ name, segments: [{ value: count, color: 'green' }], label: count })));
</script>

<template>
  <BarChart :rows="rows" :max="maxCount" :name-width="100" label="inside">
    <template #title>
      Number of Use Cases per Layer
    </template>
  </BarChart>
</template>
