<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Button from './Button.vue';
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

defineProps(['tactic', 'techniques']);


// Method to handle clicks outside of buttons and their tooltips.
const handleClickOutside = (event: MouseEvent) => {
  if (
    !(event.target as HTMLElement).closest('button') &&
    !(event.target as HTMLElement).closest('.tooltip')
  ) {
    store.pinnedTooltipId = '';
  }
};

// Add click event listener on mount
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// Remove click event listener on unmount
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
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
    
    <!-- Compute the tactic-visiblity solely based on the amount of visible techniques. -->
    <!-- <p class="button-column-stats2"> {{ Math.round(tactic.techniques.filter(technique => technique.visibility).length / tactic.techniques.length * 100) }}% visibility </p> -->
    
    <!-- Compute the tactic-visibility based on the technique visibility_ratio value (which is a weighted value based on the visibility of the technique AND its sub techniques). -->
    <p class="button-column-stat-2">{{ Math.round(tactic.techniques.reduce((sum, technique) => sum + (technique.visibility ? technique.visibility_ratio : 0), 0) / tactic.techniques.length * 100) }}% visibility</p>
  </div>

  <!-- Techniques column -->
  <div v-for="(technique, index) in techniques" :key="index">
    <Button :technique="technique"/>
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
  width: 140px;
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
