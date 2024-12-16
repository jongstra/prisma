<script setup lang="ts">
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

interface Component {
  name: string;
  technique_count: number;
  subtechnique_count: number;
  all_technique_count: number;
  quality: Object;
}

function getTopNewComponents(): Component[] {
  let components;

  if (store.domain === 'enterprise-attack') {
    components = store.enterprise?.data_components;
  } else if (store.domain === 'mobile-attack') {
    components = store.mobile?.data_components;
  } else if (store.domain === 'ics-attack') {
    components = store.ics?.data_components;
  }

  // Check if components is defined and is an array
  if (!Array.isArray(components)) {
    return [];
  }

  // Return the top 15 components (that are not used yet), which increase (sub)technique visibility the most. 
  return components
    .filter((component) =>component.visibility == false)
    .filter((component) => component.all_technique_count > 0)
    .slice(0, 15)
    .map((component) => ({
      name: component.name,
      technique_count: component.technique_count,
      subtechnique_count: component.subtechnique_count,
    }));
}

</script>


<template>
  <div class="item-visualization">
    <div class="title">
      Suggested Components: New
      <span v-if="getTopNewComponents().length >= 15"> (Top 15)</span>
      <!-- - Nr. (Sub)Techniques -->
    </div>
    <hr>
    <div v-for="(component, index) in getTopNewComponents()" :key="index" class="item-row">
      <div class="item-name">{{ component.name }}</div>
      <div class="bar-container">
        <div 
          class="bar blue-bar" 
          :style="{ width: component.technique_count * 0.8 + 'px' }"
        ></div>
        <div 
          class="bar lightblue-bar" 
          :style="{ width: component.subtechnique_count * 0.8 + 'px' }"
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
