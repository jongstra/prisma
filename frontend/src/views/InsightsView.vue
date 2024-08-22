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
