<script setup lang="ts">
import { computed } from 'vue';
import { barWidth } from '@/components/common/barWidth';
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

interface Component {
  name: string;
  technique_count: number;
  subtechnique_count: number;
  all_technique_count: number;
  quality: Object;
}

function getTopCoverageComponents(): Component[] {
  const components = store.currentDomain?.data_components;

  // Check if components is defined and is an array
  if (!Array.isArray(components)) {
    return [];
  }

  // Return the top 15 components (that are not used yet), which increase (sub)technique visibility the most. 
  return components
    .filter((component) => component.visibility == true)
    .filter((component) => component.quality.device_completeness < 5)
    .filter((component) => component.all_technique_count > 0)
    .slice(0, 15)
    .map((component) => ({
      name: component.name,
      technique_count: component.technique_count,
      subtechnique_count: component.subtechnique_count,
      coverage: (component.quality.device_completeness * 0.2 * 100).toFixed(0),
    }));
}


// The longest bar in this chart fills the box.
const maxCount = computed(() => Math.max(0, ...getTopCoverageComponents().map((x) => x.technique_count + x.subtechnique_count)));
</script>


<template>
  <div class="item-visualization">
    <div class="title">
      Suggestion: Improve Coverage of Exisiting Components
      <span v-if="getTopCoverageComponents().length >= 15"> (Top 15)</span>
      <!-- - Nr. (Sub)Techniques -->
    </div>
    <hr>
    <div v-for="(component, index) in getTopCoverageComponents()" :key="index" class="item-row">
      <div class="item-name">{{ component.name }} <br/> [Current Coverage: {{component.coverage}}%] </div>
      <div class="bar-container">
        <div 
          class="bar blue-bar" 
          :style="{ width: barWidth(component.technique_count, maxCount) }"
        ></div>
        <div 
          class="bar lightblue-bar" 
          :style="{ width: barWidth(component.subtechnique_count, maxCount) }"
        ></div>
        <span class="item-count">{{ component.technique_count + component.subtechnique_count }}</span>
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
  display: flex;
  align-items: center;
  position: relative;
  height: 14px;
  width: 100%;
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
