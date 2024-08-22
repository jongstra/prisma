<script setup lang="ts">
  import { tacticsStore } from '@/stores/tactics';
  import AttackTacticsInsights from '@/components/insights/AttackTacticsInsights.vue';
  import AttackPlatformsInsights from '@/components/insights/AttackPlatformsInsights.vue';
  import AttackGroupsInsights from '@/components/insights/AttackGroupsInsights.vue';
</script>

<template>
  <AttackTacticsInsights/>
  <br>
  <AttackPlatformsInsights/>
  <br>
  <AttackGroupsInsights/>
</template>

<!-- <template>
  <div class="insights">
      <div class="insight" v-for="(count, tactic) in store.tacticsWithTechniqueCount">
        <div>{{tactic}}: {{count}} techniques</div>
      </div>
  </div>
</template> -->

<!-- <template>
  <div class="insights">
    <div class="insight" v-for="stat in store.tacticStats(store.domain)" :key="stat.name">
      <div>{{ stat.name }}</div>
      <div>Total Techniques: {{ stat.totalTechniques }}</div>
      <div>Visible Techniques: {{ stat.visibleTechniques }}</div>
      <div>Visibility Percentage: {{ stat.visibilityPercentage.toFixed(2) }}%</div>
    </div>
  </div>
</template> -->




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
