<script setup lang="ts">
  import { tacticsStore } from '@/stores/tactics';
  const store = tacticsStore()
</script>


<!-- <template>
  <div class="insights">
      <div class="insight" v-for="(count, tactic) in store.tacticsWithTechniqueCount">
        <div>{{tactic}}: {{count}} techniques</div>
      </div>
  </div>
</template> -->

<template>
  <div class="insights">
    <div class="insight" v-for="stat in store.tacticStats" :key="stat.name">
      <div>{{ stat.name }}</div>
      <div>Total Techniques: {{ stat.totalTechniques }}</div>
      <div>Visible Techniques: {{ stat.visibleTechniques }}</div>
      <div>Visibility Percentage: {{ stat.visibilityPercentage.toFixed(2) }}%</div>
    </div>
  </div>
</template>


<style>

.insights {
  display: grid;
  grid-column: 1;
}

.insight {
  border: 2px solid black;
  padding: 2px;
  margin: 2px;
  border-radius: 5px;
}

</style>
