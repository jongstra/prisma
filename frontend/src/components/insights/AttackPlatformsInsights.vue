<script setup lang="ts">
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

interface Platform {
  name: string;
  technique_count: number;
}

function getTechniqueCountPerPlatform(): Platform[] {
  let platforms;

  if (store.domain === 'enterprise-attack') {
    platforms = store.enterprise?.platforms;
  } else if (store.domain === 'mobile-attack') {
    platforms = store.mobile?.platforms;
  } else if (store.domain === 'ics-attack') {
    platforms = store.ics?.platforms;
  }

  // Check if platforms is defined and is an array
  if (!Array.isArray(platforms)) {
    return [];
  }

  return platforms.map((platform) => ({
    name: platform.name,
    technique_count: platform.technique_count,
  }));
}
</script>

<template>
  <div class="item-visualization">
    <div class=title>
      # Techniques per Platform
    </div>
    <hr>
    <div v-for="(platform, index) in getTechniqueCountPerPlatform()" :key="index" class="item-row">
      <div class="item-name">{{ platform.name }}</div>
      <div class="bar-container">
        <div class="bar" :style="{ width: platform.technique_count * 0.5 + 'px' }">
          <span class="item-count">{{ platform.technique_count }}</span>
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
  margin-top: 5px;
  margin-bottom: 5px;
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
  background-color: #3498db;
  position: relative;
}

.item-count {
  position: absolute;
  left: 100%;
  margin-left: 4px;
  font-size: 12px;
}
</style>
