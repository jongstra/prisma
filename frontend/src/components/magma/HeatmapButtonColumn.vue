<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import HeatmapButton from './HeatmapButton.vue';
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

defineProps(['tactic', 'techniques']);

let domain;
if (store.domain === 'enterprise-attack') {
  domain = store.enterprise;
} else if (store.domain === 'mobile-attack') {
  domain = store.mobile;
} else if (store.domain === 'ics-attack') {
  domain = store.ics;
}

// // Method to handle clicks outside of buttons and their tooltips, to close button tooltips.
// const handleClickOutsideToCloseTooltips = (event: MouseEvent) => {
//   if (
//     !(event.target as HTMLElement).closest('button') &&
//     !(event.target as HTMLElement).closest('.tooltip') &&
//     !(event.target as HTMLElement).closest('.group-box') &&
//     !(event.target as HTMLElement).closest('.component-box')
//   ) {
//     store.pinnedTooltipId = '';
//   }
// };

// // Method to handle movements outside of tooltip group buttons, to remove group.hovered properties.
// const handleMoveOutsideToDisableGroupHover = (event: MouseEvent) => {
//   if (
//     !(event.target as HTMLElement).closest('.group-box')
//   ) {
//     domain.groups.forEach(group => {
//       delete group.hovered;
//     });
//   }
// };
// // Method to handle movements outside of tooltip component buttons, to remove component.hovered properties.
// const handleMoveOutsideToDisableComponentHover = (event: MouseEvent) => {
//   if (
//     !(event.target as HTMLElement).closest('.component-box')
//   ) {
//     domain.data_components.forEach(component => {
//       delete component.hovered;
//     });
//   }
// };

// // Add click event listener on mount
// onMounted(() => {
//   document.addEventListener('click', handleClickOutsideToCloseTooltips);
//   document.addEventListener('mousemove', handleMoveOutsideToDisableGroupHover);
//   document.addEventListener('mousemove', handleMoveOutsideToDisableComponentHover);
// });

// // Remove click event listener on unmount
// onUnmounted(() => {
//   document.removeEventListener('click', handleClickOutsideToCloseTooltips);
//   document.removeEventListener('mousemove', handleMoveOutsideToDisableGroupHover);
//   document.removeEventListener('mousemove', handleMoveOutsideToDisableComponentHover);
// });
</script>


<template>
<div ref="buttonColumnRef" class="button-column">
  
  <!-- Tactic -->
  <div class="button-column-tactic-name-div">
    <p class="button-column-tactic-name"> {{ tactic.name }} </p>
  </div>

  <!-- Technique count statistic -->
  <div class="button-column-stats-div">
    <p class="button-column-stat-1"> {{ tactic.techniques.length }} techniques </p>
    
    <!-- Compute the tactic-visibility based on the technique visibility_ratio value. -->
    <!-- <p class="button-column-stat-2">{{ Math.round(tactic.techniques.reduce((sum, technique) => sum + (technique.visibility ? technique.visibility_ratio : 0), 0) / tactic.techniques.length * 100) }}% visibility</p> -->
  </div>

  <!-- Techniques column -->
  <div v-for="(technique, index) in techniques" :key="index">
    <HeatmapButton :technique="technique"/>
  </div>

</div>
</template>

<style scoped>
.button-column {
  display: grid;
}

.button-column-tactic-name-div, .button-column-stats-div {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-column-tactic-name {
  align-content: flex-end;
  height: 40px;
  width: 141px;
  margin-bottom: 5px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
}

.button-column-stat-1 {
  font-size: 12px;
  margin-bottom: 3px;
}

.button-column-stat-2 {
  font-size: 9px;
  margin-bottom: 4px;
}
</style>
