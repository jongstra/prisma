<script setup lang="ts">
import { barWidth } from '@/components/common/barWidth';
import { computed } from 'vue';
import { tacticsStore } from '@/stores/tactics';
import { averageVisibilityPercentage, isDetectable } from '@/domain/attack/visibility';
const store = tacticsStore();

function getTactics(): any {
  let tactics;

  if (store.domain === 'enterprise-attack' && store.enterprise?.tactics) {
    tactics = store.enterprise.tactics.slice(); // Create a shallow copy
  } else if (store.domain === 'mobile-attack' && store.mobile?.tactics) {
    tactics = store.mobile.tactics.slice(); // Create a shallow copy
  } else if (store.domain === 'ics-attack' && store.ics?.tactics) {
    tactics = store.ics.tactics.slice(); // Create a shallow copy
  }

  if (!tactics) {
    return []; // Return an empty array if no tactics are found
  }

  return tactics;
  // Sort the copied array by visibility percentage in descending order
  // return tactics.sort((a, b) => getVisibilityPercentage(a) - getVisibilityPercentage(b));
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
</script>

<template>
  <div class="item-visualization">
    <div class="title">
      Tactics - Visibility Percentage
    </div>
    <hr>
    <div v-for="tactic in getTactics()" class="item-row">
      <div class="item-name">{{ tactic.name }}</div>
      <div class="bar-container">
        <div 
          class="bar" 
          :style="{ 
            width: barWidth(getVisibilityPercentage(tactic), 100), 
            backgroundColor: getBarColor(getVisibilityPercentage(tactic)) 
          }"
        >
          <span class="item-count">{{ getVisibilityPercentage(tactic) }}</span>
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
