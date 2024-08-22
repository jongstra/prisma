<script setup lang="ts">
  import { tacticsStore } from '@/stores/tactics';
  import AttackTacticsInsights from '@/components/insights/AttackTacticsInsights.vue';
  import AttackPlatformsInsights from '@/components/insights/AttackPlatformsInsights.vue';
  import AttackGroupsInsights from '@/components/insights/AttackGroupsInsights.vue';
</script>

<template>
  <div class="horizontal-container">
    <AttackTacticsInsights/>
    <AttackPlatformsInsights/>
    <AttackGroupsInsights/>
  </div>
</template>

<style>
.horizontal-container {
  display: flex;
  flex-wrap: wrap; /* This will allow items to wrap to the next line */
  justify-content: flex-start; /* Adjust as needed to control spacing */
}

.insight {
  border: 2px solid black;
  padding: 2px;
  margin: 2px;
  border-radius: 5px;
  flex: 1 1 calc(33% - 40px); /* Each item takes up about a third of the row, with some space between */
}
</style>