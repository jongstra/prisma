<script setup lang="ts">
import { barWidth } from '@/components/common/barWidth';
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
</script>

<template>
  <div class="item-visualization">
    <div class="title">
      Platforms - Visibility Percentage
    </div>
    <hr>
    <div v-for="platform in calculatePlatformVisibility()" :key="platform.name" class="item-row">
      <div class="item-name">{{ platform.name }}</div>
      <div class="bar-container">
        <div 
          class="bar" 
          :style="{ 
            width: barWidth(platform.percentage, 100), 
            backgroundColor: getBarColor(platform.percentage) 
          }"
        >
          <span class="item-count">{{ platform.percentage }}</span>
        </div>
      </div>
    </div>
    <div v-if="notDetectableCount > 0" class="footnote">
      Not counted: {{ notDetectableCount }} technique(s) for which ATT&CK lists no data components (not detectable via data sources).
    </div>
  </div>
</template>

<style scoped>
.item-visualization {
  display: flex;
  flex-direction: column;
  border: 2px solid black;
  border-radius: 5px;
  width: 450px;
  margin-top: 10px;
  margin-right: 10px;
}

.title {
  text-align: center;
  margin: 5px;
  font-size: 16px;
  font-weight: bold;
}

.item-row {
  display: flex;
  align-items: center;
  margin: 5px;
}

.item-name {
  min-width: 170px;
  text-align: right;
  padding-right: 10px;
  font-size: 13px;
}

.bar-container {
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.bar {
  height: 14px;
  background-color: SteelBlue;
  position: relative;
}

.item-count {
  position: absolute;
  left: 100%;
  margin-left: 4px;
  font-size: 12px;
}

.footnote {
  margin: 2px 8px 6px;
  font-size: 11px;
  color: #555555;
  text-align: center;
}
</style>
