<script setup lang="ts">
import { computed } from 'vue';
import { barWidth } from '@/components/common/barWidth';
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
</script>


<template>
  <div class="item-visualization">
    <div class="title">
      Platforms - Number of (Sub)Techniques
    </div>
    <hr>
    <div v-for="(platform, index) in getTechniqueCountPerPlatform()" :key="index" class="item-row">
      <div class="item-name">{{ platform.name }}</div>
      <div class="bar-container">
        <div 
          class="bar blue-bar" 
          :style="{ width: barWidth(platform.technique_count, maxCount) }"
        ></div>
        <div 
          class="bar lightblue-bar" 
          :style="{ width: barWidth(platform.subtechnique_count, maxCount) }"
        ></div>
        <span class="item-count">{{ platform.technique_count + platform.subtechnique_count }}</span>
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
  position: relative;
  height: 14px;
}

.bar {
  height: 14px;
}

.blue-bar {
  background-color: SteelBlue;
}

.lightblue-bar {
  background-color: #89AFCF;
}

.item-count {
  margin-left: 4px;
  font-size: 12px;
}
</style>

