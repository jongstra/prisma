<script setup lang="ts">
import BarChart from '@/components/common/BarChart.vue';
import { computed } from 'vue';
import { tacticsStore } from '@/stores/tactics';
import { averageVisibilityPercentage, isDetectable } from '@/domain/attack/visibility';
const store = tacticsStore();

function getTactics(): any {
  const tactics = store.currentDomain?.tactics?.slice(); // A shallow copy

  if (!tactics) {
    return []; // Return an empty array if no tactics are found
  }

  return tactics;
}

// Visibility of a tactic: the average over its techniques that can be detected via data sources.
function getVisibilityPercentage(tactic) {
  return Math.round(averageVisibilityPercentage(tactic.techniques) ?? 0);
}

// Number of (unique) techniques in the domain that cannot be detected via data sources; these are left out of the averages.
const notDetectableCount = computed(() => new Set(
  (getTactics()).flatMap((tactic: any) => tactic.techniques).filter((technique: any) => !isDetectable(technique)).map((technique: any) => technique.external_id)
).size);

function getBarColor(percentage) {
  const red = Math.max(0, 255 - (255 * percentage) / 100);
  const green = Math.min(255, (255 * percentage) / 100);
  return `rgb(${red}, ${green}, 0)`;
}

// One bar per tactic, from red (0%) to green (100%).
const rows = computed(() => getTactics().map((tactic: any) => {
  const percentage = getVisibilityPercentage(tactic);
  return { name: tactic.name, segments: [{ value: percentage, color: getBarColor(percentage) }], label: percentage };
}));
</script>

<template>
  <BarChart :rows="rows" :max="100" label="inside">
    <template #title>
      Tactics - Visibility Percentage
    </template>
    <template #footnote>
      <div v-if="notDetectableCount > 0" class="footnote">
        Not counted: {{ notDetectableCount }} technique(s) for which ATT&CK lists no data components (not detectable via data sources).
      </div>
    </template>
  </BarChart>
</template>

<style scoped>
.footnote {
  margin: 2px 8px 6px;
  font-size: 11px;
  color: #555555;
  text-align: center;
}
</style>
