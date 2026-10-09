<script setup lang="ts">
import HeatmapButton from './HeatmapButton.vue';

defineProps(['tactic', 'techniques']);
</script>


<template>
<div class="button-column">
  
  <!-- Tactic -->
  <div class="button-column-tactic-name-div">
    <p class="button-column-tactic-name"> {{ tactic.name }} </p>
  </div>

  <!-- Technique count statistic -->
  <div class="button-column-stats-div">
    <p class="button-column-stat-1"> {{ tactic.techniques.length }} techniques </p>
  </div>

  <!-- Techniques column -->
  <div v-for="technique in techniques" :key="technique.external_id">
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
</style>
