<script setup lang="ts">
import BarChart from '@/components/common/BarChart.vue';
import { computed } from 'vue';
import { tacticsStore } from '@/stores/tactics';
import { isDetectable, platformVisibility } from '@/domain/attack/visibility';
const store = tacticsStore();

function getDomain(): any {
  return store.currentDomain || {};
}

function getPlatforms(): string[] {
  const platformsSet = new Set<string>();
  let domain = getDomain();

  if (domain.platforms) {
    domain.platforms.forEach(platform => {
      platformsSet.add(platform.name);
    });
  }

  return Array.from(platformsSet);
}

// Visibility per platform (see platformVisibility). ICS techniques have no platforms; they all count under 'None'.
function calculatePlatformVisibility(): { name: string; percentage: number }[] {
  const domain = getDomain();
  const platformsOf = store.domain === 'ics-attack' ? () => ['None'] : undefined;
  const visibility = platformVisibility(domain.tactics ?? [], platformsOf);

  // Calculate the visibility percentage for each platform and sort by percentage
  return getPlatforms().map(platform => ({
    name: platform,
    percentage: Math.round(visibility.get(platform) ?? 0),
  })).sort((a, b) => a.percentage - b.percentage);
}

// Number of (unique) techniques in the domain that cannot be detected via data sources; these are left out of the averages.
const notDetectableCount = computed(() => new Set(
  (getDomain().tactics ?? []).flatMap((tactic: any) => tactic.techniques).filter((technique: any) => !isDetectable(technique)).map((technique: any) => technique.external_id)
).size);

function getBarColor(percentage: number): string {
  const red = Math.max(0, 255 - (255 * percentage) / 100);
  const green = Math.min(255, (255 * percentage) / 100);
  return `rgb(${red}, ${green}, 0)`;
}

// One bar per platform, from red (0%) to green (100%).
const rows = computed(() => calculatePlatformVisibility().map((platform) => (
  { name: platform.name, segments: [{ value: platform.percentage, color: getBarColor(platform.percentage) }], label: platform.percentage }
)));
</script>

<template>
  <BarChart :rows="rows" :max="100" label="inside">
    <template #title>
      Platforms - Visibility Percentage
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
