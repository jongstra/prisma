<script setup lang="ts">
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

function getDomain(): any {
  let domain;
  
  if (store.domain === 'enterprise-attack' && store.enterprise) {
    domain = store.enterprise;
  } else if (store.domain === 'mobile-attack' && store.mobile) {
    domain = store.mobile;
  } else if (store.domain === 'ics-attack' && store.ics) {
    domain = store.ics;
  }

  return domain || {};
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

function calculatePlatformVisibility(): { name: string; percentage: number }[] {
  const platformCounts: { [key: string]: number } = {};
  const techniqueCounts: { [key: string]: number } = {};

  // Initialize the platform counts and technique counts with zero
  getPlatforms().forEach(platform => {
    platformCounts[platform] = 0;
    techniqueCounts[platform] = 0;
  });

  let domain = getDomain();

  if (domain.tactics) {
    // Iterate through all tactics and techniques to count the platforms with visibility
    domain.tactics.forEach(tactic => {
      tactic.techniques.forEach(technique => {
        if (technique.visibility) {
          if (store.domain === 'ics-attack') {
            platformCounts['None'] += technique.visibility_ratio;
          } else {
            technique.platforms.forEach(platform => {
              if (platform in platformCounts) {
                platformCounts[platform] += technique.visibility_ratio;
              }
            });
          }
        }

        if (store.domain === 'ics-attack') {
          techniqueCounts['None']++;
        } else {
          technique.platforms.forEach(platform => {
            if (platform in techniqueCounts) {
              techniqueCounts[platform]++;
            }
          });
        }
      });
    });
  }

  // Calculate the visibility percentage for each platform and sort by percentage
  const result = Object.keys(platformCounts).map(platform => ({
    name: platform,
    percentage: Math.round((platformCounts[platform] / techniqueCounts[platform]) * 100),
  })).sort((a, b) => a.percentage - b.percentage);

  return result;
}

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
            width: (platform.percentage * 2.3) + 'px', 
            backgroundColor: getBarColor(platform.percentage) 
          }"
        >
          <span class="item-count">{{ platform.percentage }}</span>
        </div>
      </div>
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
</style>
